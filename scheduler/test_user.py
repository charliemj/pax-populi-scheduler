import unittest
from datetime import date, datetime

import pytz

import unit_test_constants as c
from weekly_time import WeeklyTime
from availability import Availability
from user import User

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
    
if __name__ == '__main__':
    unittest.main()