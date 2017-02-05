from datetime import date, datetime, timedelta
import pytz
import unittest

from availability import Availability
from match import Match
import unit_test_constants as c
from weekly_time import WeeklyTime

class TestMatch(unittest.TestCase):
    def test_init_value_error(self):
        with self.assertRaises(ValueError):
            Match(c.tutor, c.tutor, c.sunday_0000, c.dt_2000_1_1, 1)
        with self.assertRaises(ValueError):
            Match(c.student, c.student, c.sunday_0000, c.dt_2000_1_1, 1)
        with self.assertRaises(ValueError):
            Match(c.student, c.tutor, c.sunday_0000, c.utc_halloween, 1)
        with self.assertRaises(ValueError):
            Match(c.student, c.tutor, c.sunday_0000, c.dt_2000_1_1, 0)

    def test_init_attributes(self):
        self.assertEqual(c.match_two_weeks.student, c.student)
        self.assertEqual(c.match_two_weeks.tutor, c.tutor)
        self.assertEqual(c.match_two_weeks.shared_courses, ['Math'])
        self.assertEqual(c.match_two_weeks.course_start_wt_UTC,
                         WeeklyTime(0, 5, 0))
        self.assertEqual(c.match_two_weeks.earliest_course_start_UTC,
                         datetime(2018, 1, 1, 5, 0))
        self.assertEqual(c.match_two_weeks.weeks_per_course, 2)
        student_course_schedule = [c.et.localize(datetime(2018, 1, 7, 0, 0)),
                                   c.et.localize(datetime(2018, 1, 14, 0, 0))]
        self.assertEqual(c.match_two_weeks.student_course_schedule,
                         student_course_schedule)
        tutor_course_schedule = [c.kabul.localize(datetime(2018, 1, 7, 9, 30)),
                                 c.kabul.localize(datetime(2018, 1, 14, 9, 30))]
        self.assertEqual(c.match_two_weeks.tutor_course_schedule,
                         tutor_course_schedule)
        UTC_course_schedule = [c.utc.localize(datetime(2018, 1, 7, 5, 0)),
                               c.utc.localize(datetime(2018, 1, 14, 5, 0))]
        self.assertEqual(c.match_two_weeks.UTC_course_schedule,
                         UTC_course_schedule)

    def test_get_course_schedules_utc(self):
        schedule = [c.utc.localize(datetime(2018, 1, 7, 0, 0)),
                           c.utc.localize(datetime(2018, 1, 14, 0, 0))]
        schedules = (schedule, schedule, schedule)
        self.assertEqual(c.match_utc.get_course_schedules(), schedules)

    def test_get_course_schedules_et_no_ds_kabul(self):
        student_course_schedule = [c.et.localize(datetime(2018, 1, 7, 0, 0)),
                                   c.et.localize(datetime(2018, 1, 14, 0, 0))]
        tutor_course_schedule = [c.kabul.localize(datetime(2018, 1, 7, 9, 30)),
                                   c.kabul.localize(datetime(2018, 1, 14, 9, 30))]
        UTC_course_schedule = [c.utc.localize(datetime(2018, 1, 7, 5, 0)),
                               c.utc.localize(datetime(2018, 1, 14, 5, 0))]
        schedules = (student_course_schedule, tutor_course_schedule,
                     UTC_course_schedule)
        self.assertEqual(c.match_two_weeks.get_course_schedules(), schedules)

    def test_get_course_schedules_et_ds_kabul(self):
        student_course_schedule = [c.et.localize(datetime(2017, 5, 7, 0, 0)),
                                   c.et.localize(datetime(2017, 5, 14, 0, 0))]
        tutor_course_schedule = [c.kabul.localize(datetime(2017, 5, 7, 8, 30)),
                                   c.kabul.localize(datetime(2017, 5, 14, 8, 30))]
        UTC_course_schedule = [c.utc.localize(datetime(2017, 5, 7, 4, 0)),
                               c.utc.localize(datetime(2017, 5, 14, 4, 0))]
        schedules = (student_course_schedule, tutor_course_schedule,
                     UTC_course_schedule)
        self.assertEqual(c.match_et_ds_kabul.get_course_schedules(), schedules)

    def test_get_course_schedules_first_course_nonexistent(self):
        student_course_schedule = [c.et.localize(datetime(2018, 3, 11, 2, 15)),
                                   c.et.localize(datetime(2018, 3, 18, 2, 15))]
        tutor_course_schedule = [c.kabul.localize(datetime(2018, 3, 11, 11, 45)),
                                   c.kabul.localize(datetime(2018, 3, 18, 10, 45))]
        UTC_course_schedule = [c.utc.localize(datetime(2018, 3, 11, 7, 15)),
                               c.utc.localize(datetime(2018, 3, 18, 6, 15))]
        schedules = (student_course_schedule, tutor_course_schedule,
                     UTC_course_schedule)
        self.assertEqual(c.match_first_course_nonexistent.get_course_schedules(),
                         schedules)

    def test_get_course_schedules_first_course_ambiguous(self):
        student_course_schedule = [c.et.localize(datetime(2018, 11, 4, 1, 15)),
                                   c.et.localize(datetime(2018, 11, 11, 1, 15))]
        tutor_course_schedule = [c.kabul.localize(datetime(2018, 11, 4, 10, 45)),
                                   c.kabul.localize(datetime(2018, 11, 11, 10, 45))]
        UTC_course_schedule = [c.utc.localize(datetime(2018, 11, 4, 6, 15)),
                               c.utc.localize(datetime(2018, 11, 11, 6, 15))]
        schedules = (student_course_schedule, tutor_course_schedule,
                     UTC_course_schedule)
        self.assertEqual(c.match_first_course_ambiguous.get_course_schedules(),
                         schedules)

    def test_daylight_saving_valid_utc(self):
        self.assertTrue(c.match_utc.daylight_saving_valid())

    def test_daylight_saving_valid_et_no_ds_kabul(self):
        self.assertTrue(c.match_two_weeks.daylight_saving_valid())

    def test_daylight_saving_valid_et_ds_kabul(self):
        self.assertTrue(c.match_et_ds_kabul.daylight_saving_valid())

    def test_daylight_saving_valid_first_course_nonexistent(self):
        self.assertFalse(c.match_first_course_nonexistent.daylight_saving_valid())

    def test_daylight_saving_valid_first_course_ambiguous(self):
        self.assertFalse(c.match_first_course_ambiguous.daylight_saving_valid())

    def test_to_dict_one_week(self):
        match_dict = c.match_one_week.to_dict()
        correct_match_dict = {'studentID': 'user1', 'tutorID': 'user2',
                              'studentRegID': 'reg1', 'tutorRegID': 'reg2',
                              'possibleCourses': ['Math'],
                              'studentClassSchedule': ['2018-01-07 00:00'],
                              'tutorClassSchedule': ['2018-01-07 09:30'],
                              'UTCClassSchedule': ['2018-01-07 05:00']}
        self.assertEqual(match_dict, correct_match_dict)

    def test_to_dict_two_weeks(self):
        match_dict = c.match_two_weeks.to_dict()
        correct_match_dict = {'studentID': 'user1', 'tutorID': 'user2',
                              'studentRegID': 'reg1', 'tutorRegID': 'reg2',
                              'possibleCourses': ['Math'],
                              'studentClassSchedule': ['2018-01-07 00:00',
                                                       '2018-01-14 00:00'],
                              'tutorClassSchedule': ['2018-01-07 09:30',
                                                     '2018-01-14 09:30'],
                              'UTCClassSchedule': ['2018-01-07 05:00',
                                                   '2018-01-14 05:00']}
        self.assertEqual(match_dict, correct_match_dict)

if __name__ == '__main__':
    unittest.main()