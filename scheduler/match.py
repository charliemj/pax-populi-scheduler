import pytz
from availability import Availability, WeeklyTime
from datetime import timedelta

"""
Represents a match between a student and a tutor.
"""
class Match:
    def __init__(self, student, tutor, class_start_wt_UTC,
                 scheduler_earliest_class_start_UTC, weeks_per_class):
        """
        Args:
            student: A student User object.
            tutor: A tutor User object.
            class_start_wt_UTC: A WeeklyTime object representing the
                time in UTC for student and tutor to hold their class.
            scheduler_earliest_class_start_UTC: A naive datetime object
                representing the earliest possible datetime in UTC for the
                first class from the scheduler point of view.
            weeks_per_class: A positive integer representing the number of
                occurrences of the class, assuming the class meets once per
                week.
        """
        self.student = student
        self.tutor = tutor
        self.shared_courses = student.shared_courses(tutor)
        self.class_start_wt_UTC = class_start_wt_UTC
        self.earliest_class_start_UTC = max(scheduler_earliest_class_start_UTC,
                                            student.get_earliest_start_dt_UTC(),
                                            tutor.get_earliest_start_dt_UTC())
        self.weeks_per_class = weeks_per_class
        (self.student_class_schedule, self.tutor_class_schedule, self.UTC_class_schedule) = self.get_class_schedules()
        print self.student.ID, self.tutor.ID, self.daylight_saving_valid(), self.class_start_wt_UTC

    def get_class_schedules(self):
        """
        Computes the datetimes of the student's class schedule and of the
        tutor's class schedule.

        Returns:
            student_class_schedule: A list of datetimes of class start times
                localized to the student's timezone.
            tutor_class_schedule: A list of datetimes of class start times
                localized to the tutor's timezone.
            UTC_class_schedule: A list of datetimes of class start times
                localized to UTC.
        """
        localized_UTC = pytz.utc.localize(self.earliest_class_start_UTC)
        earliest_class_start_student = localized_UTC.astimezone(self.student.tz)
        student_wt = Availability.new_timezone_wt(self.class_start_wt_UTC,
                                                  localized_UTC,
                                                  self.student.tz_string)
        student_first_class_dt = student_wt.first_datetime_after(earliest_class_start_student)
        student_class_schedule_unlocalized = [student_first_class_dt
                                              + timedelta(Availability.DAYS_PER_WEEK*i)
                                              for i in range(self.weeks_per_class)]
        student_class_schedule = map(lambda x: self.student.tz.localize(x),
                                     student_class_schedule_unlocalized) 
        tutor_class_schedule = [student_dt.astimezone(self.tutor.tz)
                                for student_dt in student_class_schedule]
        UTC_class_schedule = [student_dt.astimezone(pytz.utc)
                              for student_dt in student_class_schedule]
        for (s,t, u) in zip(student_class_schedule, tutor_class_schedule, UTC_class_schedule):
            print str(s), str(t), str(u)
        return (student_class_schedule, tutor_class_schedule, UTC_class_schedule)

    def daylight_saving_valid(self):
        """Determines whether or not the match is valid during all weeks of the
        schedule. Even though the match will definitely be valid on 
        earliest_class_start_UTC, it is possible that the student or tutor will
        no longer be able to make the class if daylight saving occurs for the
        student or for the tutor as the class progresses.

        Returns:
            A boolean whether or not both the student and the tutor can make
                all classes in their respective schedules.
        """
        for student_dt in self.student_class_schedule:
            student_wt = WeeklyTime.from_datetime(student_dt)
            index = Availability.SLOT_START_TIME_TO_INDEX[student_wt]
            if not self.student.availability.free_class_slots[index]:
                return False
        for tutor_dt in self.tutor_class_schedule:
            tutor_wt = WeeklyTime.from_datetime(tutor_dt)
            index = Availability.SLOT_START_TIME_TO_INDEX[tutor_wt]
            if not self.tutor.availability.free_class_slots[index]:
                return False
        return True

    def to_dict(self):
        dt_format = '%Y-%m-%d %H:%M'
        student_schedule_strings = [dt.strftime(dt_format)
                                    for dt in self.student_class_schedule]
        tutor_schedule_strings = [dt.strftime(dt_format)
                                  for dt in self.tutor_class_schedule]
        UTC_schedule_strings = [dt.strftime(dt_format)
                                for dt in self.UTC_class_schedule]    
        match_dict = {'student_ID': self.student.ID,
                      'tutor_ID': self.tutor.ID,
                      'shared_courses': self.shared_courses,
                      'student_class_schedule': student_schedule_strings,
                      'tutor_class_schedule': tutor_schedule_strings,
                      'UTC_class_schedule': UTC_schedule_strings,}
        return match_dict
