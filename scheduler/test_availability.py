import unittest
from availability import WeeklyTime, Availability
from datetime import datetime

class TestWeeklyTime(unittest.TestCase):
    def setUp(self):
        self.sunday_0000 = WeeklyTime(0, 0, 0)
        self.monday_0000 = WeeklyTime(1, 0, 0)
        self.sunday_2300 = WeeklyTime(0, 23, 0)
        self.sunday_0059 = WeeklyTime(0, 0, 59)
        self.saturday_0000 = WeeklyTime(6, 0, 0)
        self.dt_2017_01_29 = datetime(2017, 1, 29)
        self.dt_2017_01_29_0059 = datetime(2017, 1, 29, 00, 59)
        self.dt_2001_09_10 = datetime(2001, 9, 10)

    def test_str_saturday_0000(self):
        self.assertEqual(str(self.saturday_0000), 'Saturday 00:00')

    def test_str_sunday_0000(self):
        self.assertEqual(str(self.sunday_0000), 'Sunday 00:00')

    def test_sunday_0000_equals_sunday_0000(self):
        self.assertEqual(self.sunday_0000, WeeklyTime(0, 0, 0))

    def test_sunday_0000_does_not_equal_monday_0000(self):
        self.assertNotEqual(self.sunday_0000, self.monday_0000)

    def test_sunday_0000_does_not_equal_sunday_2300(self):
        self.assertNotEqual(self.sunday_0000, self.sunday_2300)

    def test_sunday_0000_does_not_equal_sunday_0059(self):
        self.assertNotEqual(self.sunday_0000, self.sunday_0059)

    def test_from_datetime_2017_01_29(self):
        self.assertEqual(WeeklyTime.from_datetime(self.dt_2017_01_29),
                         self.sunday_0000)

    def test_from_datetime_2017_01_29_0059(self):
        self.assertEqual(WeeklyTime.from_datetime(self.dt_2017_01_29_0059),
                         self.sunday_0059)

    def test_from_datetime_2001_09_10(self):
        self.assertEqual(WeeklyTime.from_datetime(self.dt_2001_09_10),
                         self.monday_0000)

    def test_first_datetime_after_same_time(self):
        self.assertEqual(self.sunday_0000.first_datetime_after(self.dt_2017_01_29),
                         self.dt_2017_01_29)

    def test_first_datetime_after_same_day_different_time(self):
        self.assertEqual(self.sunday_0059.first_datetime_after(datetime(2017, 1, 29, 0, 58)),
                         datetime(2017, 1, 29, 0, 59))
        self.assertEqual(self.sunday_0059.first_datetime_after(datetime(2017, 1, 29, 1, 0)),
                         datetime(2017, 2, 5, 0, 59))

    def test_first_datetime_after_different_days(self):
        self.assertEqual(self.saturday_0000.first_datetime_after(datetime(2017, 1, 31, 17, 44)),
                         datetime(2017, 2, 4, 0, 0))

    '''
    def test_split(self):
        s = 'hello world'
        self.assertEqual(s.split(), ['hello', 'world'])
        # check that s.split fails when the separator is not a string
        with self.assertRaises(TypeError):
            s.split(2)
    '''

class TestAvailability(unittest.TestCase):
    def setUp(self):
        pass

    def test_blah(self):
        self.assertTrue(True)

if __name__ == '__main__':
    unittest.main()