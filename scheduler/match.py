import pytz
from availability import Availability, WeeklyTime
from datetime import timedelta

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
        if weeks_per_course <= 0:
            raise ValueError('weeks_per_course must be a positive integer')
        self.student = student
        self.tutor = tutor
        self.shared_courses = student.shared_courses(tutor)
        self.course_start_wt_UTC = course_start_wt_UTC
        self.earliest_course_start_UTC = earliest_course_start_UTC
        self.weeks_per_course = weeks_per_course
        (self.student_course_schedule, self.tutor_course_schedule, self.UTC_course_schedule) = self.get_course_schedules()

    def get_course_schedules(self):
        """
        Computes the datetimes of the student's course schedule and of the
        tutor's course schedule.

        Returns:
            student_course_schedule: A list of datetimes of course start times
                localized to the student's timezone.
            tutor_course_schedule: A list of datetimes of course start times
                localized to the tutor's timezone.
            UTC_course_schedule: A list of datetimes of course start times
                localized to UTC.
        """
        localized_UTC = pytz.utc.localize(self.earliest_course_start_UTC)
        earliest_course_start_student = localized_UTC.astimezone(self.student.tz)
        student_wt = Availability.new_timezone_wt(self.course_start_wt_UTC,
                                                  localized_UTC,
                                                  self.student.tz_string)
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
        student or for the tutor as the course progresses.

        Returns:
            A boolean whether or not both the student and the tutor can make
                all courses in their respective schedules.
        """
        for student_dt in self.student_course_schedule:
            student_wt = WeeklyTime.from_datetime(student_dt)
            index = Availability.SLOT_START_TIME_TO_INDEX[student_wt]
            if not self.student.availability.free_course_slots[index]:
                return False
        for tutor_dt in self.tutor_course_schedule:
            tutor_wt = WeeklyTime.from_datetime(tutor_dt)
            index = Availability.SLOT_START_TIME_TO_INDEX[tutor_wt]
            if not self.tutor.availability.free_course_slots[index]:
                return False
        return True

    def to_dict(self):
        dt_format = '%Y-%m-%d %H:%M'
        student_schedule_strings = [dt.strftime(dt_format)
                                    for dt in self.student_course_schedule]
        tutor_schedule_strings = [dt.strftime(dt_format)
                                  for dt in self.tutor_course_schedule]
        UTC_schedule_strings = [dt.strftime(dt_format)
                                for dt in self.UTC_course_schedule]    
        match_dict = {'student_ID': self.student.ID,
                      'tutor_ID': self.tutor.ID,
                      'shared_courses': self.shared_courses,
                      'student_course_schedule': student_schedule_strings,
                      'tutor_course_schedule': tutor_schedule_strings,
                      'UTC_course_schedule': UTC_schedule_strings,}
        return match_dict