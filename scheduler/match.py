import constants
import pytz
from availability import Availability, WeeklyTime
from datetime import timedelta
from dateutil.rrule import rrule, MINUTELY

"""
Represents a match between a student and a tutor.
"""
class Match:
    def __init__(self, student, tutor, course_start_wt_UTC,
                 earliest_course_start_UTC, weeks_per_course):
        """
        Args:
            student: A student User object.
            tutor: A tutor User object.
            course_start_wt_UTC: A WeeklyTime object representing the
                time in UTC for student and tutor to hold their course.
            earliest_course_start_UTC: A naive datetime object representing the
                earliest possible datetime in UTC for the first course.
            weeks_per_course: A positive integer representing the number of
                occurrences of the course, assuming the course meets once per
                week.
        """
        if student.user_type != 'STUDENT':
            raise ValueError('student must have the user_type "STUDENT"')
        if tutor.user_type != 'TUTOR':
            raise ValueError('tutor must have the user_type "TUTOR"')
        if (earliest_course_start_UTC.tzinfo is not None
            and earliest_course_start_UTC.tzinfo.utcoffset(earliest_course_start_UTC) is not None):
            raise ValueError('earliest_course_start_UTC must be a naive datetime')
        if weeks_per_course <= 0:
            raise ValueError('weeks_per_course must be a positive integer')
        self.student = student
        self.tutor = tutor
        self.shared_courses = student.shared_courses(tutor)
        self.course_start_wt_UTC = course_start_wt_UTC
        self.earliest_course_start_UTC = earliest_course_start_UTC
        self.weeks_per_course = weeks_per_course
        (self.student_course_schedule, self.tutor_course_schedule, self.UTC_course_schedule) = self.get_course_schedules()

    @classmethod
    def naive_dt_is_valid(cls, naive_dt, tz):
        """Considers a naive datetime invalid if it is non-existent or
        ambiguous due to daylight saving in a given timezone.

        For example, in 'US/Eastern', when daylight saving time begins, the
        minute after 1:59am is 3am, and all times in [2am, 3am) are
        non-existent. Conversely, when daylight saving ends, the minute after
        2am is 1:01am, and all times in [1am, 2am) are ambiguous because they
        occur twice.

        Args:
            naive_dt: A naive datetime.
            tz: A pytz timezone object.

        Returns:
            A boolean whether or not naive_dt is valid in the timezone tz. A
                datetime is invalid if and only if it is non-existent or
                ambiguous.
        """
        if (naive_dt.tzinfo is not None
            and naive_dt.tzinfo.utcoffset(naive_dt) is not None):
            raise ValueError('naive_dt must be a timezone-naive datetime')
        if tz not in constants.PYTZ_TIMEZONES:
            raise TypeError('tz must be a pytz timezone object')
        try:
            aware_dt = tz.localize(naive_dt, is_dst=None)
        except pytz.InvalidTimeError:
            return False
        return True

    def get_course_schedules(self):
        """
        Computes the datetimes of the course schedule in the student's timezone,
        in the tutor's timezone, and in UTC.

        Returns:
            student_course_schedule: A list of datetimes of course start times
                localized to the student's timezone.
            tutor_course_schedule: A list of datetimes of course start times
                localized to the tutor's timezone.
            UTC_course_schedule: A list of datetimes of course start times
                localized to UTC.
        """
        aware_UTC_start = pytz.utc.localize(self.earliest_course_start_UTC)
        earliest_course_start_student = aware_UTC_start.astimezone(self.student.tz)
        student_wt = Availability.new_timezone_wt(self.course_start_wt_UTC,
                                                  aware_UTC_start,
                                                  self.student.tz_str)
        student_first_course_dt = student_wt.first_datetime_after(earliest_course_start_student)
        student_course_schedule_naive = [student_first_course_dt
                                         + timedelta(Availability.DAYS_PER_WEEK*i)
                                         for i in range(self.weeks_per_course)]
        student_course_schedule = map(lambda x: self.student.tz.localize(x),
                                     student_course_schedule_naive) 
        tutor_course_schedule = [student_dt.astimezone(self.tutor.tz)
                                for student_dt in student_course_schedule]
        UTC_course_schedule = [student_dt.astimezone(pytz.utc)
                              for student_dt in student_course_schedule]
        return (student_course_schedule, tutor_course_schedule, UTC_course_schedule)

    def daylight_saving_valid(self):
        """Determines whether or not the match is valid during all weeks of the
        schedule. Even though the match will definitely be valid on 
        earliest_course_start_UTC, it is possible that the student or tutor will
        no longer be able to make the course if daylight saving occurs for the
        student or for the tutor as the course progresses. Also, some of the
        scheduled datetimes may be non-existent or ambiguous because of
        daylight saving.

        Returns:
            A boolean whether or not both the student and the tutor can make
                all courses in their respective schedules.
        """
        # Check that the student schedule is valid
        for student_dt in self.student_course_schedule:
            student_wt = WeeklyTime.from_datetime(student_dt)
            index = Availability.SLOT_START_TIME_TO_INDEX[student_wt]
            if not self.student.availability.free_course_slots[index]:
                return False
            # Check that all minutes of the class are valid
            naive_student_dt = student_dt.replace(tzinfo=None)
            for i in range(Availability.MINUTES_PER_COURSE):
                dt = naive_student_dt + timedelta(minutes=i)
                if not self.naive_dt_is_valid(dt, self.student.tz):
                    return False

        # Check that the tutor schedule is valid
        for tutor_dt in self.tutor_course_schedule:
            tutor_wt = WeeklyTime.from_datetime(tutor_dt)
            index = Availability.SLOT_START_TIME_TO_INDEX[tutor_wt]
            if not self.tutor.availability.free_course_slots[index]:
                return False
            # Check that all minutes of the class are valid
            naive_tutor_dt = tutor_dt.replace(tzinfo=None)
            for i in range(Availability.MINUTES_PER_COURSE):
                dt = naive_tutor_dt + timedelta(minutes=i)
                if not self.naive_dt_is_valid(dt, self.tutor.tz):
                    return False
        return True

    def to_dict(self):
        dt_to_str = lambda x: x.strftime('%Y-%m-%d %H:%M')
        student_schedule_strings = map(dt_to_str, self.student_course_schedule)
        tutor_schedule_strings = map(dt_to_str, self.tutor_course_schedule)
        UTC_schedule_strings = map(dt_to_str, self.UTC_course_schedule)
        match_dict = {'studentID': self.student.user_id,
                      'tutorID': self.tutor.user_id,
                      'studentRegID': self.student.reg_id,
                      'tutorRegID': self.tutor.reg_id,
                      'possibleCourses': self.shared_courses,
                      'studentClassSchedule': student_schedule_strings,
                      'tutorClassSchedule': tutor_schedule_strings,
                      'UTCClassSchedule': UTC_schedule_strings}
        return match_dict