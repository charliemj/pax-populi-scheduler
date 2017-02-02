from datetime import date, datetime, timedelta
import pytz
import unittest

import mock

from availability import Availability
import unit_test_constants as c
from user import User
from weekly_time import WeeklyTime

class TestUser(unittest.TestCase):
    def test_init_attributes(self):
        self.assertEqual(c.student.user_id, 'user1')
        self.assertEqual(c.student.reg_id, 'reg1')
        self.assertEqual(c.student.user_type, 'STUDENT')
        self.assertEqual(c.student.gender, 'MALE')
        self.assertEqual(c.student.gender_preference, 'NONE')
        self.assertEqual(c.student.availability, c.free_first_six_avail)
        self.assertEqual(c.student.tz_str, 'UTC')
        self.assertEqual(c.student.tz, pytz.timezone('UTC'))
        self.assertEqual(c.student.courses, ['Math'])
        self.assertEqual(c.student.courses_set, set(['Math']))
        self.assertEqual(c.student.earliest_start_date, date(2018, 1, 1))
    
    def test_init_value_error(self):
        with self.assertRaises(ValueError):
            c.new_user(c.student, {'user_type': 'student'})
        with self.assertRaises(ValueError):
            c.new_user(c.student, {'gender': 'male'})
        with self.assertRaises(ValueError):
            c.new_user(c.student, {'gender_preference': 'None'})
    
    def test_init_type_error(self):
        with self.assertRaises(TypeError):
            c.new_user(c.student, {'earliest_start_date': datetime(2018,1,1)})

    def test_get_earliest_start_dt_UTC_utc(self):
        user = c.new_user(c.student, {'tz_str': 'UTC',
                                      'earliest_start_date': date(2000, 1, 1)})
        earliest_start_dt_UTC = user.get_earliest_start_dt_UTC()
        self.assertEqual(earliest_start_dt_UTC, datetime(2000, 1, 1, 0, 0))

    def test_get_earliest_start_dt_UTC_central_time_daylight_saving(self):
        user = c.new_user(c.student, {'tz_str': 'US/Central',
                                      'earliest_start_date': date(2017, 11, 5)})
        earliest_start_dt_UTC = user.get_earliest_start_dt_UTC()
        self.assertEqual(earliest_start_dt_UTC, datetime(2017, 11, 5, 5, 0))

    def test_get_earliest_start_dt_UTC_central_time_no_daylight_saving(self):
        user = c.new_user(c.student, {'tz_str': 'US/Central',
                                      'earliest_start_date': date(2017, 3, 12)})
        earliest_start_dt_UTC = user.get_earliest_start_dt_UTC()
        self.assertEqual(earliest_start_dt_UTC, datetime(2017, 3, 12, 6, 0))
    
    @mock.patch('user.datetime', c.FakeDatetime)
    def test_get_shared_earliest_start_dt_UTC_utcnow_max(self):
        user1 = c.new_user(c.student,
                           {'earliest_start_date': date(1995, 1, 1)})
        user2 = c.new_user(c.student,
                           {'earliest_start_date': date(1996, 1, 1)})
        dt = user1.get_shared_earliest_start_dt_UTC(user2)
        self.assertEqual(dt, c.fake_utc_now + timedelta(days=7))
        dt = user2.get_shared_earliest_start_dt_UTC(user1)
        self.assertEqual(dt, c.fake_utc_now + timedelta(days=7))

    def test_share_course_empty_empty(self):
        user1 = c.new_user(c.student, {'courses': []})
        user2 = c.new_user(c.student, {'courses': []})
        self.assertFalse(user1.share_course(user2))
        self.assertFalse(user2.share_course(user1))

    def test_share_course_empty_nonempty(self):
        user1 = c.new_user(c.student, {'courses': ['Math']})
        user2 = c.new_user(c.student, {'courses': []})
        self.assertFalse(user1.share_course(user2))
        self.assertFalse(user2.share_course(user1))

    def test_share_course_nonempty_nonempty_intersection_size_zero(self):
        user1 = c.new_user(c.student, {'courses': ['Math']})
        user2 = c.new_user(c.student, {'courses': ['English']})
        self.assertFalse(user1.share_course(user2))
        self.assertFalse(user2.share_course(user1))

    def test_share_course_nonempty_nonempty_intersection_size_one(self):
        user1 = c.new_user(c.student, {'courses': ['Math', 'English']})
        user2 = c.new_user(c.student, {'courses': ['English']})
        self.assertTrue(user1.share_course(user2))
        self.assertTrue(user2.share_course(user1))

    def test_share_course_nonempty_nonempty_intersection_size_two(self):
        user1 = c.new_user(c.student, {'courses': ['Math', 'English']})
        user2 = c.new_user(c.student, {'courses': ['Math', 'English']})
        self.assertTrue(user1.share_course(user2))
        self.assertTrue(user2.share_course(user1))

    def test_shared_courses_empty_empty(self):
        user1 = c.new_user(c.student, {'courses': []})
        user2 = c.new_user(c.student, {'courses': []})
        self.assertEqual(user1.shared_courses(user2), [])
        self.assertEqual(user2.shared_courses(user1), [])

    def test_shared_courses_empty_nonempty(self):
        user1 = c.new_user(c.student, {'courses': ['Math']})
        user2 = c.new_user(c.student, {'courses': []})
        self.assertEqual(user1.shared_courses(user2), [])
        self.assertEqual(user2.shared_courses(user1), [])

    def test_shared_courses_nonempty_nonempty_intersection_size_zero(self):
        user1 = c.new_user(c.student, {'courses': ['Math']})
        user2 = c.new_user(c.student, {'courses': ['English']})
        self.assertEqual(user1.shared_courses(user2), [])
        self.assertEqual(user2.shared_courses(user1), [])

    def test_shared_courses_nonempty_nonempty_intersection_size_one(self):
        user1 = c.new_user(c.student, {'courses': ['Math', 'English']})
        user2 = c.new_user(c.student, {'courses': ['English']})
        self.assertEqual(user1.shared_courses(user2), ['English'])
        self.assertEqual(user2.shared_courses(user1), ['English'])

    def test_shared_courses_nonempty_nonempty_intersection_size_two(self):
        user1 = c.new_user(c.student, {'courses': ['Math', 'English']})
        user2 = c.new_user(c.student, {'courses': ['Math', 'English']})
        self.assertEqual(user1.shared_courses(user2), ['English', 'Math'])
        self.assertEqual(user2.shared_courses(user1), ['English', 'Math'])

    def test_gender_compatible_M_M_M_M(self):
        user1 = c.new_user(c.student, {'gender': 'MALE',
                                       'gender_preference': 'MALE'})
        user2 = c.new_user(c.student, {'gender': 'MALE',
                                       'gender_preference': 'MALE'})
        self.assertTrue(user1.gender_compatible(user2))

    def test_gender_compatible_M_M_M_F(self):
        user1 = c.new_user(c.student, {'gender': 'MALE',
                                       'gender_preference': 'MALE'})
        user2 = c.new_user(c.student, {'gender': 'MALE',
                                       'gender_preference': 'FEMALE'})
        self.assertFalse(user1.gender_compatible(user2))

    def test_gender_compatible_M_M_M_N(self):
        user1 = c.new_user(c.student, {'gender': 'MALE',
                                       'gender_preference': 'MALE'})
        user2 = c.new_user(c.student, {'gender': 'MALE',
                                       'gender_preference': 'NONE'})
        self.assertTrue(user1.gender_compatible(user2))

    def test_gender_compatible_M_M_F_M(self):
        user1 = c.new_user(c.student, {'gender': 'MALE',
                                       'gender_preference': 'MALE'})
        user2 = c.new_user(c.student, {'gender': 'FEMALE',
                                       'gender_preference': 'MALE'})
        self.assertFalse(user1.gender_compatible(user2))

    def test_gender_compatible_M_M_F_F(self):
        user1 = c.new_user(c.student, {'gender': 'MALE',
                                       'gender_preference': 'MALE'})
        user2 = c.new_user(c.student, {'gender': 'FEMALE',
                                       'gender_preference': 'FEMALE'})
        self.assertFalse(user1.gender_compatible(user2))

    def test_gender_compatible_M_M_F_N(self):
        user1 = c.new_user(c.student, {'gender': 'MALE',
                                       'gender_preference': 'MALE'})
        user2 = c.new_user(c.student, {'gender': 'FEMALE',
                                       'gender_preference': 'NONE'})
        self.assertFalse(user1.gender_compatible(user2))

    def test_gender_compatible_M_F_M_M(self):
        user1 = c.new_user(c.student, {'gender': 'MALE',
                                       'gender_preference': 'FEMALE'})
        user2 = c.new_user(c.student, {'gender': 'MALE',
                                       'gender_preference': 'MALE'})
        self.assertFalse(user1.gender_compatible(user2))

    def test_gender_compatible_M_F_M_F(self):
        user1 = c.new_user(c.student, {'gender': 'MALE',
                                       'gender_preference': 'FEMALE'})
        user2 = c.new_user(c.student, {'gender': 'MALE',
                                       'gender_preference': 'FEMALE'})
        self.assertFalse(user1.gender_compatible(user2))

    def test_gender_compatible_M_F_M_N(self):
        user1 = c.new_user(c.student, {'gender': 'MALE',
                                       'gender_preference': 'FEMALE'})
        user2 = c.new_user(c.student, {'gender': 'MALE',
                                       'gender_preference': 'NONE'})
        self.assertFalse(user1.gender_compatible(user2))

    def test_gender_compatible_M_F_F_M(self):
        user1 = c.new_user(c.student, {'gender': 'MALE',
                                       'gender_preference': 'FEMALE'})
        user2 = c.new_user(c.student, {'gender': 'FEMALE',
                                       'gender_preference': 'MALE'})
        self.assertTrue(user1.gender_compatible(user2))

    def test_gender_compatible_M_F_F_F(self):
        user1 = c.new_user(c.student, {'gender': 'MALE',
                                       'gender_preference': 'FEMALE'})
        user2 = c.new_user(c.student, {'gender': 'FEMALE',
                                       'gender_preference': 'FEMALE'})
        self.assertFalse(user1.gender_compatible(user2))

    def test_gender_compatible_M_F_F_N(self):
        user1 = c.new_user(c.student, {'gender': 'MALE',
                                       'gender_preference': 'FEMALE'})
        user2 = c.new_user(c.student, {'gender': 'FEMALE',
                                       'gender_preference': 'NONE'})
        self.assertTrue(user1.gender_compatible(user2))

    def test_gender_compatible_M_N_M_M(self):
        user1 = c.new_user(c.student, {'gender': 'MALE',
                                       'gender_preference': 'NONE'})
        user2 = c.new_user(c.student, {'gender': 'MALE',
                                       'gender_preference': 'MALE'})
        self.assertTrue(user1.gender_compatible(user2))

    def test_gender_compatible_M_N_M_F(self):
        user1 = c.new_user(c.student, {'gender': 'MALE',
                                       'gender_preference': 'NONE'})
        user2 = c.new_user(c.student, {'gender': 'MALE',
                                       'gender_preference': 'FEMALE'})
        self.assertFalse(user1.gender_compatible(user2))

    def test_gender_compatible_M_N_M_N(self):
        user1 = c.new_user(c.student, {'gender': 'MALE',
                                       'gender_preference': 'NONE'})
        user2 = c.new_user(c.student, {'gender': 'MALE',
                                       'gender_preference': 'NONE'})
        self.assertTrue(user1.gender_compatible(user2))

    def test_gender_compatible_M_N_F_M(self):
        user1 = c.new_user(c.student, {'gender': 'MALE',
                                       'gender_preference': 'NONE'})
        user2 = c.new_user(c.student, {'gender': 'FEMALE',
                                       'gender_preference': 'MALE'})
        self.assertTrue(user1.gender_compatible(user2))

    def test_gender_compatible_M_N_F_F(self):
        user1 = c.new_user(c.student, {'gender': 'MALE',
                                       'gender_preference': 'NONE'})
        user2 = c.new_user(c.student, {'gender': 'FEMALE',
                                       'gender_preference': 'FEMALE'})
        self.assertFalse(user1.gender_compatible(user2))

    def test_gender_compatible_M_N_F_N(self):
        user1 = c.new_user(c.student, {'gender': 'MALE',
                                       'gender_preference': 'NONE'})
        user2 = c.new_user(c.student, {'gender': 'FEMALE',
                                       'gender_preference': 'NONE'})
        self.assertTrue(user1.gender_compatible(user2))

    def test_gender_compatible_F_M_M_M(self):
        user1 = c.new_user(c.student, {'gender': 'FEMALE',
                                       'gender_preference': 'MALE'})
        user2 = c.new_user(c.student, {'gender': 'MALE',
                                       'gender_preference': 'MALE'})
        self.assertFalse(user1.gender_compatible(user2))

    def test_gender_compatible_F_M_M_F(self):
        user1 = c.new_user(c.student, {'gender': 'FEMALE',
                                       'gender_preference': 'MALE'})
        user2 = c.new_user(c.student, {'gender': 'MALE',
                                       'gender_preference': 'FEMALE'})
        self.assertTrue(user1.gender_compatible(user2))

    def test_gender_compatible_F_M_M_N(self):
        user1 = c.new_user(c.student, {'gender': 'FEMALE',
                                       'gender_preference': 'MALE'})
        user2 = c.new_user(c.student, {'gender': 'MALE',
                                       'gender_preference': 'NONE'})
        self.assertTrue(user1.gender_compatible(user2))

    def test_gender_compatible_F_M_F_M(self):
        user1 = c.new_user(c.student, {'gender': 'FEMALE',
                                       'gender_preference': 'MALE'})
        user2 = c.new_user(c.student, {'gender': 'FEMALE',
                                       'gender_preference': 'MALE'})
        self.assertFalse(user1.gender_compatible(user2))

    def test_gender_compatible_F_M_F_F(self):
        user1 = c.new_user(c.student, {'gender': 'FEMALE',
                                       'gender_preference': 'MALE'})
        user2 = c.new_user(c.student, {'gender': 'FEMALE',
                                       'gender_preference': 'FEMALE'})
        self.assertFalse(user1.gender_compatible(user2))

    def test_gender_compatible_F_M_F_N(self):
        user1 = c.new_user(c.student, {'gender': 'FEMALE',
                                       'gender_preference': 'MALE'})
        user2 = c.new_user(c.student, {'gender': 'FEMALE',
                                       'gender_preference': 'NONE'})
        self.assertFalse(user1.gender_compatible(user2))

    def test_gender_compatible_F_F_M_M(self):
        user1 = c.new_user(c.student, {'gender': 'FEMALE',
                                       'gender_preference': 'FEMALE'})
        user2 = c.new_user(c.student, {'gender': 'MALE',
                                       'gender_preference': 'MALE'})
        self.assertFalse(user1.gender_compatible(user2))

    def test_gender_compatible_F_F_M_F(self):
        user1 = c.new_user(c.student, {'gender': 'FEMALE',
                                       'gender_preference': 'FEMALE'})
        user2 = c.new_user(c.student, {'gender': 'MALE',
                                       'gender_preference': 'FEMALE'})
        self.assertFalse(user1.gender_compatible(user2))

    def test_gender_compatible_F_F_M_N(self):
        user1 = c.new_user(c.student, {'gender': 'FEMALE',
                                       'gender_preference': 'FEMALE'})
        user2 = c.new_user(c.student, {'gender': 'MALE',
                                       'gender_preference': 'NONE'})
        self.assertFalse(user1.gender_compatible(user2))

    def test_gender_compatible_F_F_F_M(self):
        user1 = c.new_user(c.student, {'gender': 'FEMALE',
                                       'gender_preference': 'FEMALE'})
        user2 = c.new_user(c.student, {'gender': 'FEMALE',
                                       'gender_preference': 'MALE'})
        self.assertFalse(user1.gender_compatible(user2))

    def test_gender_compatible_F_F_F_F(self):
        user1 = c.new_user(c.student, {'gender': 'FEMALE',
                                       'gender_preference': 'FEMALE'})
        user2 = c.new_user(c.student, {'gender': 'FEMALE',
                                       'gender_preference': 'FEMALE'})
        self.assertTrue(user1.gender_compatible(user2))

    def test_gender_compatible_F_F_F_N(self):
        user1 = c.new_user(c.student, {'gender': 'FEMALE',
                                       'gender_preference': 'FEMALE'})
        user2 = c.new_user(c.student, {'gender': 'FEMALE',
                                       'gender_preference': 'NONE'})
        self.assertTrue(user1.gender_compatible(user2))

    def test_gender_compatible_F_N_M_M(self):
        user1 = c.new_user(c.student, {'gender': 'FEMALE',
                                       'gender_preference': 'NONE'})
        user2 = c.new_user(c.student, {'gender': 'MALE',
                                       'gender_preference': 'MALE'})
        self.assertFalse(user1.gender_compatible(user2))

    def test_gender_compatible_F_N_M_F(self):
        user1 = c.new_user(c.student, {'gender': 'FEMALE',
                                       'gender_preference': 'NONE'})
        user2 = c.new_user(c.student, {'gender': 'MALE',
                                       'gender_preference': 'FEMALE'})
        self.assertTrue(user1.gender_compatible(user2))

    def test_gender_compatible_F_N_M_N(self):
        user1 = c.new_user(c.student, {'gender': 'FEMALE',
                                       'gender_preference': 'NONE'})
        user2 = c.new_user(c.student, {'gender': 'MALE',
                                       'gender_preference': 'NONE'})
        self.assertTrue(user1.gender_compatible(user2))

    def test_gender_compatible_F_N_F_M(self):
        user1 = c.new_user(c.student, {'gender': 'FEMALE',
                                       'gender_preference': 'NONE'})
        user2 = c.new_user(c.student, {'gender': 'FEMALE',
                                       'gender_preference': 'MALE'})
        self.assertFalse(user1.gender_compatible(user2))

    def test_gender_compatible_F_N_F_F(self):
        user1 = c.new_user(c.student, {'gender': 'FEMALE',
                                       'gender_preference': 'NONE'})
        user2 = c.new_user(c.student, {'gender': 'FEMALE',
                                       'gender_preference': 'FEMALE'})
        self.assertTrue(user1.gender_compatible(user2))

    def test_gender_compatible_F_N_F_N(self):
        user1 = c.new_user(c.student, {'gender': 'FEMALE',
                                       'gender_preference': 'NONE'})
        user2 = c.new_user(c.student, {'gender': 'FEMALE',
                                       'gender_preference': 'NONE'})
        self.assertTrue(user1.gender_compatible(user2))

    def test_new_timezone_availability_value_error(self):
        with self.assertRaises(ValueError):
            c.student.new_timezone_availability('utc', c.dt_2000_1_1)
        with self.assertRaises(ValueError):
            c.student.new_timezone_availability('UTC', c.utc_halloween)

    def test_new_timezone_availability_invalid_datetime(self):
        with self.assertRaises(ValueError):
            c.student.new_timezone_availability('US/Mountain',
                                                c.dt_us_nonexistent)
        with self.assertRaises(ValueError):
            c.student.new_timezone_availability('US/Mountain',
                                                c.dt_us_ambiguous)

    def test_new_timezone_availability_same_timezone(self):
        for tz_str in pytz.all_timezones:
            # Relies on the fact that datetime(2000, 1, 1) is valid in all timezones
            user = c.new_user(c.student, {'tz_str': tz_str})
            new_avail = user.new_timezone_availability(tz_str,
                                                       datetime(2000, 1, 1))
            self.assertEqual(new_avail, user.availability)

    def test_new_timezone_availability_utc_et_no_daylight_saving(self):
        # Shift forward
        user = c.new_user(c.student, {'tz_str': 'US/Eastern'})
        new_avail = user.new_timezone_availability('UTC', c.dt_us_no_ds)
        avail = Availability.from_dict({'0': [['05:00', '06:30']]})
        self.assertEqual(new_avail, avail)

        # Shift backward
        user = c.new_user(c.student, {'tz_str': 'UTC'})
        new_avail = user.new_timezone_availability('US/Eastern', c.dt_us_no_ds)
        avail = Availability.from_dict({'6': [['19:00', '20:30']]})
        self.assertEqual(new_avail, avail)

    def test_new_timezone_availability_utc_et_daylight_saving(self):
        # Shift forward
        user = c.new_user(c.student, {'tz_str': 'US/Eastern'})
        new_avail = user.new_timezone_availability('UTC', c.dt_us_ds)
        avail = Availability.from_dict({'0': [['04:00', '05:30']]})
        self.assertEqual(new_avail, avail)

        # Shift backward
        user = c.new_user(c.student, {'tz_str': 'UTC'})
        new_avail = user.new_timezone_availability('US/Eastern', c.dt_us_ds)
        avail = Availability.from_dict({'6': [['20:00', '21:30']]})
        self.assertEqual(new_avail, avail)

    def test_shared_course_start_times_UTC_same_timezone_no_overlap(self):
        for tz_str in pytz.all_timezones:
            user1 = c.new_user(c.student, {'tz_str': tz_str,
                                           'availability': c.free_first_five_avail})
            user2 = c.new_user(c.student, {'tz_str': tz_str,
                                           'availability': c.free_first_six_avail})
            shared = user1.shared_course_start_times_UTC(user2)
            self.assertEqual(shared, [])
            shared = user2.shared_course_start_times_UTC(user1)
            self.assertEqual(shared, [])

    #def test_shared_course_start_times_UTC_utc_et_



if __name__ == '__main__':
    unittest.main()