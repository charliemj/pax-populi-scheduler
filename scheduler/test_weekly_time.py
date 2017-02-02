from datetime import datetime
import unittest

import unit_test_constants as c
from weekly_time import WeeklyTime

class TestWeeklyTime(unittest.TestCase):
    def test_str_saturday_0000(self):
        self.assertEqual(str(c.saturday_0000), 'Saturday 00:00')

    def test_str_sunday_0000(self):
        self.assertEqual(str(c.sunday_0000), 'Sunday 00:00')

    def test_sunday_0000_equals_sunday_0000(self):
        self.assertEqual(c.sunday_0000, WeeklyTime(0, 0, 0))

    def test_sunday_0000_does_not_equal_monday_0000(self):
        self.assertNotEqual(c.sunday_0000, c.monday_0000)

    def test_sunday_0000_does_not_equal_sunday_2300(self):
        self.assertNotEqual(c.sunday_0000, c.sunday_2300)

    def test_sunday_0000_does_not_equal_sunday_0059(self):
        self.assertNotEqual(c.sunday_0000, c.sunday_0059)

    def test_from_datetime_2017_01_29(self):
        self.assertEqual(WeeklyTime.from_datetime(c.dt_2017_01_29),
                         c.sunday_0000)

    def test_from_datetime_2017_01_29_0059(self):
        self.assertEqual(WeeklyTime.from_datetime(c.dt_2017_01_29_0059),
                         c.sunday_0059)

    def test_from_datetime_2001_09_10(self):
        self.assertEqual(WeeklyTime.from_datetime(c.dt_2001_09_10),
                         c.monday_0000)

    def test_first_datetime_after_same_time(self):
        self.assertEqual(c.sunday_0000.first_datetime_after(c.dt_2017_01_29),
                         c.dt_2017_01_29)

    def test_first_datetime_after_same_day_different_time(self):
        self.assertEqual(c.sunday_0059.first_datetime_after(datetime(2017, 1, 29, 0, 58)),
                         datetime(2017, 1, 29, 0, 59))
        self.assertEqual(c.sunday_0059.first_datetime_after(datetime(2017, 1, 29, 1, 0)),
                         datetime(2017, 2, 5, 0, 59))

    def test_first_datetime_after_one_day_difference(self):
        wt = WeeklyTime(3, 0, 0)
        first_dt_after = wt.first_datetime_after(datetime(2017, 1, 31, 17, 44))
        self.assertEqual(first_dt_after, datetime(2017, 2, 1, 0, 0))

    def test_first_datetime_after_two_day_difference(self):
        wt = WeeklyTime(4, 0, 0)
        first_dt_after = wt.first_datetime_after(datetime(2017, 1, 31, 17, 44))
        self.assertEqual(first_dt_after, datetime(2017, 2, 2, 0, 0))

    def test_first_datetime_after_three_day_difference(self):
        wt = WeeklyTime(5, 0, 0)
        first_dt_after = wt.first_datetime_after(datetime(2017, 1, 31, 17, 44))
        self.assertEqual(first_dt_after, datetime(2017, 2, 3, 0, 0))

    def test_first_datetime_after_four_day_difference(self):
        wt = WeeklyTime(6, 0, 0)
        first_dt_after = wt.first_datetime_after(datetime(2017, 1, 31, 17, 44))
        self.assertEqual(first_dt_after, datetime(2017, 2, 4, 0, 0))

    def test_first_datetime_after_five_day_difference(self):
        wt = WeeklyTime(0, 0, 0)
        first_dt_after = wt.first_datetime_after(datetime(2017, 1, 31, 17, 44))
        self.assertEqual(first_dt_after, datetime(2017, 2, 5, 0, 0))

    def test_first_datetime_after_six_day_difference(self):
        wt = WeeklyTime(1, 0, 0)
        first_dt_after = wt.first_datetime_after(datetime(2017, 1, 31, 17, 44))
        self.assertEqual(first_dt_after, datetime(2017, 2, 6, 0, 0))

if __name__ == '__main__':
    unittest.main()