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
        self.assertEqual(c.student.availability, c.always_free_avail)
        self.assertEqual(c.student.tz_str, 'UTC')
        self.assertEqual(c.student.courses, ['Math'])
        self.assertEqual(c.student.courses_set, set(['Math']))
        self.assertEqual(c.student.earliest_start_date, date(2018, 1, 1))
    '''
    def test_init_value_error(self):
    '''

if __name__ == '__main__':
    unittest.main()