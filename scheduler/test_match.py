import unittest
import unit_test_constants as c
from datetime import datetime, timedelta
import pytz
from match import Match

class TestMatch(unittest.TestCase):
    def test_naive_dt_is_valid_value_error(self):
        with self.assertRaises(ValueError):
            Match.naive_dt_is_valid(c.utc_halloween, c.utc)

    def test_naive_dt_is_valid_type_error(self):
        with self.assertRaises(TypeError):
            Match.naive_dt_is_valid(c.dt_2000_1_1, 'UTC')
    
    '''
    def test_naive_dt_is_valid_arizona(self):
            for i in range(366*c.MINUTES_PER_DAY):
                self.assertTrue(Match.naive_dt_is_valid(c.dt_2000_1_1 + timedelta(minutes=i), c.arizona))
    '''

    def test_naive_dt_is_valid_eastern_time_daylight_saving_start(self):
        for i in range(c.MINUTES_PER_HOUR):
            self.assertFalse(Match.naive_dt_is_valid(c.us_daylight_saving_start + timedelta(minutes=i), c.et))
        self.assertTrue(Match.naive_dt_is_valid(c.us_daylight_saving_start + timedelta(minutes=c.MINUTES_PER_HOUR), c.et))
        self.assertTrue(Match.naive_dt_is_valid(c.us_daylight_saving_start - timedelta(minutes=1), c.et))

    def test_naive_dt_is_valid_eastern_time_daylight_saving_end(self):
        for i in range(c.MINUTES_PER_HOUR):
            self.assertFalse(Match.naive_dt_is_valid(c.us_daylight_saving_end + timedelta(minutes=i), c.et))
        self.assertTrue(Match.naive_dt_is_valid(c.us_daylight_saving_end + timedelta(minutes=c.MINUTES_PER_HOUR), c.et))
        self.assertTrue(Match.naive_dt_is_valid(c.us_daylight_saving_end - timedelta(minutes=1), c.et))

    def test_naive_dt_is_valid_central_time_daylight_saving_start(self):
        for i in range(c.MINUTES_PER_HOUR):
            self.assertFalse(Match.naive_dt_is_valid(c.us_daylight_saving_start + timedelta(minutes=i), c.central))
        self.assertTrue(Match.naive_dt_is_valid(c.us_daylight_saving_start + timedelta(minutes=c.MINUTES_PER_HOUR), c.central))
        self.assertTrue(Match.naive_dt_is_valid(c.us_daylight_saving_start - timedelta(minutes=1), c.central))

    def test_naive_dt_is_valid_central_time_daylight_saving_end(self):
        for i in range(c.MINUTES_PER_HOUR):
            self.assertFalse(Match.naive_dt_is_valid(c.us_daylight_saving_end + timedelta(minutes=i), c.central))
        self.assertTrue(Match.naive_dt_is_valid(c.us_daylight_saving_end + timedelta(minutes=c.MINUTES_PER_HOUR), c.central))
        self.assertTrue(Match.naive_dt_is_valid(c.us_daylight_saving_end - timedelta(minutes=1), c.central))    


if __name__ == '__main__':
    unittest.main()