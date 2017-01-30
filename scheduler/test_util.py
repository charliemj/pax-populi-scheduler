import unittest
from datetime import datetime, timedelta

import pytz

import unit_test_constants as c
import util

class TestUtil(unittest.TestCase):
    def test_naive_dt_is_valid_value_error(self):
        with self.assertRaises(ValueError):
            util.naive_dt_is_valid(c.utc_halloween, 'UTC')
        with self.assertRaises(ValueError):
            util.naive_dt_is_valid(c.utc_halloween, 'utc')

    def test_naive_dt_is_valid_arizona(self):
            for i in range(366*c.MINUTES_PER_DAY):
                self.assertTrue(util.naive_dt_is_valid(c.dt_2000_1_1 + timedelta(minutes=i), 'US/Arizona'))

    def test_naive_dt_is_valid_eastern_time_daylight_saving_start(self):
        for i in range(c.MINUTES_PER_HOUR):
            self.assertFalse(util.naive_dt_is_valid(c.dt_us_ds_start + timedelta(minutes=i), 'US/Eastern'))
        self.assertTrue(util.naive_dt_is_valid(c.dt_us_ds_start + timedelta(minutes=c.MINUTES_PER_HOUR), 'US/Eastern'))
        self.assertTrue(util.naive_dt_is_valid(c.dt_us_ds_start - timedelta(minutes=1), 'US/Eastern'))

    def test_naive_dt_is_valid_eastern_time_daylight_saving_end(self):
        for i in range(c.MINUTES_PER_HOUR):
            self.assertFalse(util.naive_dt_is_valid(c.dt_us_ds_end + timedelta(minutes=i), 'US/Eastern'))
        self.assertTrue(util.naive_dt_is_valid(c.dt_us_ds_end + timedelta(minutes=c.MINUTES_PER_HOUR), 'US/Eastern'))
        self.assertTrue(util.naive_dt_is_valid(c.dt_us_ds_end - timedelta(minutes=1), 'US/Eastern'))

    def test_naive_dt_is_valid_central_time_daylight_saving_start(self):
        for i in range(c.MINUTES_PER_HOUR):
            self.assertFalse(util.naive_dt_is_valid(c.dt_us_ds_start + timedelta(minutes=i), 'US/Central'))
        self.assertTrue(util.naive_dt_is_valid(c.dt_us_ds_start + timedelta(minutes=c.MINUTES_PER_HOUR), 'US/Central'))
        self.assertTrue(util.naive_dt_is_valid(c.dt_us_ds_start - timedelta(minutes=1), 'US/Central'))

    def test_naive_dt_is_valid_central_time_daylight_saving_end(self):
        for i in range(c.MINUTES_PER_HOUR):
            self.assertFalse(util.naive_dt_is_valid(c.dt_us_ds_end + timedelta(minutes=i), 'US/Central'))
        self.assertTrue(util.naive_dt_is_valid(c.dt_us_ds_end + timedelta(minutes=c.MINUTES_PER_HOUR), 'US/Central'))
        self.assertTrue(util.naive_dt_is_valid(c.dt_us_ds_end - timedelta(minutes=1), 'US/Central'))    

if __name__ == '__main__':
    unittest.main()