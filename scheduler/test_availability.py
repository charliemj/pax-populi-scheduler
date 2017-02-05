from datetime import datetime
import pytz
import unittest

from availability import Availability
import unit_test_constants as c
from weekly_time import WeeklyTime

class TestAvailability(unittest.TestCase):
    def test_constants(self):
        self.assertEqual(Availability.MINUTES_PER_SLOT, 15)
        self.assertEqual(Availability.MINUTES_PER_COURSE, 90)
        self.assertEqual(Availability.SLOTS_PER_WEEK, c.SLOTS_PER_WEEK)
        self.assertEqual(Availability.SLOT_START_TIMES[0], WeeklyTime(0, 0, 0))
        self.assertEqual(Availability.SLOT_START_TIMES[-1], WeeklyTime(6, 23, 45))
        self.assertEqual(Availability.SLOT_START_TIME_TO_INDEX[WeeklyTime(0, 0, 0)], 0)
        self.assertEqual(Availability.SLOT_START_TIME_TO_INDEX[WeeklyTime(6, 23, 45)],
                         c.SLOTS_PER_WEEK-1)

    def test_init_value_error(self):
        with self.assertRaises(ValueError):
            Availability([])
        with self.assertRaises(ValueError):
            Availability([True for i in range(671)])
        with self.assertRaises(ValueError):
            Availability([True for i in range(673)])

    def test_free_course_slots_always_free_avail(self):
        self.assertEqual(c.always_free_avail.free_course_slots,
                         c.always_free_slots)

    def test_free_course_slots_free_first_five_avail(self):
        self.assertEqual(c.free_first_five_avail.free_course_slots,
                         c.never_free_slots)

    def test_free_course_slots_free_sat_sun_six_avail(self):
        free_course_slots = [True if i == c.SLOTS_PER_WEEK - 3
                             else False
                             for i in range(c.SLOTS_PER_WEEK)]
        self.assertEqual(c.free_sat_sun_six_avail.free_course_slots,
                         free_course_slots)

    def test_free_course_slots_nonconsecutive_free_avail(self):
        self.assertEqual(c.nonconsecutive_free_avail.free_course_slots,
                         c.never_free_slots)

    def test_str_free_first_five_avail(self):
        avail_str = ('Sunday 00:00 - Sunday 00:15\n'
                     'Sunday 00:15 - Sunday 00:30\n'
                     'Sunday 00:30 - Sunday 00:45\n'
                     'Sunday 00:45 - Sunday 01:00\n'
                     'Sunday 01:00 - Sunday 01:15')
        self.assertEqual(str(c.free_first_five_avail), avail_str)

    def test_str_never_free_avail(self):
        self.assertEqual(str(c.never_free_avail), '')

    def test_str_free_sat_sun_six_avail(self):
        avail_str = ('Sunday 00:00 - Sunday 00:15\n'
                     'Sunday 00:15 - Sunday 00:30\n'
                     'Sunday 00:30 - Sunday 00:45\n'
                     'Saturday 23:15 - Saturday 23:30\n'
                     'Saturday 23:30 - Saturday 23:45\n'
                     'Saturday 23:45 - Sunday 00:00')
        self.assertEqual(str(c.free_sat_sun_six_avail), avail_str)

    def test_str_nonconsecutive_free_avail(self):
        avail_str = ('Sunday 00:15 - Sunday 00:30\n'
                     'Sunday 00:45 - Sunday 01:00\n'
                     'Sunday 01:00 - Sunday 01:15\n'
                     'Sunday 01:15 - Sunday 01:30\n'
                     'Monday 01:00 - Monday 01:15')
        self.assertEqual(str(c.nonconsecutive_free_avail), avail_str)

    def test_time_str_to_index_0000(self):
        self.assertEqual(Availability.time_str_to_index('00:00'), 0)

    def test_time_str_to_index_0015(self):
        self.assertEqual(Availability.time_str_to_index('00:15'), 1)

    def test_time_str_to_index_0030(self):
        self.assertEqual(Availability.time_str_to_index('00:30'), 2)

    def test_time_str_to_index_2345(self):
        self.assertEqual(Availability.time_str_to_index('23:45'), 95)

    def test_time_str_to_index_2400(self):
        self.assertEqual(Availability.time_str_to_index('24:00'), 96)

    def test_time_str_to_index_value_error(self):
        with self.assertRaises(ValueError):
            Availability.time_str_to_index('0000')
        with self.assertRaises(ValueError):
            Availability.time_str_to_index('0:00')
        with self.assertRaises(ValueError):
            Availability.time_str_to_index('0:000')
        with self.assertRaises(ValueError):
            Availability.time_str_to_index('25:00')
        with self.assertRaises(ValueError):
            Availability.time_str_to_index('00:60')
        with self.assertRaises(ValueError):
            Availability.time_str_to_index('00:59')

    def test_parse_dict_value_error(self):
        with self.assertRaises(ValueError):
            Availability.parse_dict({0: ['00:00', '01:00']})
        with self.assertRaises(ValueError):
            Availability.parse_dict({'0': ['00:00']})
        with self.assertRaises(ValueError):
            Availability.parse_dict({'0': ['00:00', '00:15', '00:30']})
        with self.assertRaises(ValueError):
            Availability.parse_dict({'0': ['00:00', '00:00']})
        with self.assertRaises(ValueError):
            Availability.parse_dict({'0': ['00:14', '01:00']})

    def test_parse_dict_always_free_dict(self):
        self.assertEqual(Availability.parse_dict(c.always_free_dict),
                         set(range(c.SLOTS_PER_WEEK)))

    def test_parse_dict_free_first_five_dict(self):
        self.assertEqual(Availability.parse_dict(c.free_first_five_dict),
                         set(range(5)))    

    def test_parse_dict_never_free_dict(self):
        self.assertEqual(Availability.parse_dict(c.never_free_dict),
                         set([]))

    def test_parse_dict_free_sat_sun_six_dict(self):
        self.assertEqual(Availability.parse_dict(c.free_sat_sun_six_dict),
                         {0, 1, 2, 669, 670, 671})

    def test_parse_dict_nonconsecutive_free_dict(self):
        self.assertEqual(Availability.parse_dict(c.nonconsecutive_free_dict),
                         {1, 3, 4, 5, 100})

    def test_from_dict_value_error(self):
        with self.assertRaises(ValueError):
            Availability.from_dict({0: ['00:00', '01:00']})
        with self.assertRaises(ValueError):
            Availability.from_dict({'0': ['00:00']})
        with self.assertRaises(ValueError):
            Availability.from_dict({'0': ['00:00', '00:15', '00:30']})
        with self.assertRaises(ValueError):
            Availability.from_dict({'0': ['00:00', '00:00']})
        with self.assertRaises(ValueError):
            Availability.from_dict({'0': ['00:14', '01:00']})

    def test_from_dict_always_free_dict(self):
        self.assertEqual(Availability.from_dict(c.always_free_dict),
                         c.always_free_avail)

    def test_from_dict_free_first_five_dict(self):
        self.assertEqual(Availability.from_dict(c.free_first_five_dict),
                         c.free_first_five_avail)    

    def test_from_dict_never_free_dict(self):
        self.assertEqual(Availability.from_dict(c.never_free_dict),
                         c.never_free_avail)

    def test_from_dict_free_sat_sun_six_dict(self):
        self.assertEqual(Availability.from_dict(c.free_sat_sun_six_dict),
                         c.free_sat_sun_six_avail)

    def test_from_dict_nonconsecutive_free_dict(self):
        self.assertEqual(Availability.from_dict(c.nonconsecutive_free_dict),
                         c.nonconsecutive_free_avail)

    def test_UTC_offset_minutes_value_error(self):
        with self.assertRaises(ValueError):
            Availability.UTC_offset_minutes(c.dt_2000_1_1)
        with self.assertRaises(ValueError):
            Availability.UTC_offset_minutes(c.dt_2017_end)
    
    def test_UTC_offset_minutes_neg_offset(self):
        self.assertEqual(Availability.UTC_offset_minutes(c.et_ds), -240)
        self.assertEqual(Availability.UTC_offset_minutes(c.et_no_ds), -300)

    def test_UTC_offset_minutes_no_offset(self):
        self.assertEqual(Availability.UTC_offset_minutes(c.utc_halloween), 0)
    
    def test_UTC_offset_minutes_pos_offset(self):
        self.assertEqual(Availability.UTC_offset_minutes(c.kabul_2000_1_1), 270)
        self.assertEqual(Availability.UTC_offset_minutes(c.kathmandu_2017_end), 345)

    def test_new_timezone_wt_value_error(self):
        with self.assertRaises(ValueError):
            Availability.new_timezone_wt(WeeklyTime(0,0,14), c.utc_halloween, 'UTC')
        with self.assertRaises(ValueError):
            Availability.new_timezone_wt(WeeklyTime(0,0,0), c.dt_2000_1_1, 'UTC')
        with self.assertRaises(ValueError):
            Availability.new_timezone_wt(WeeklyTime(0,0,0), c.utc_halloween, 'utc')

    def test_new_timezone_wt_same_tz(self):
        new_wt = Availability.new_timezone_wt(c.sunday_0000, c.utc_halloween, 'UTC')
        self.assertEqual(new_wt, c.sunday_0000)

    def test_new_timezone_wt_shift_forward(self):
        new_wt = Availability.new_timezone_wt(c.sunday_0000, c.et_ds,
                                              'UTC')
        self.assertEqual(new_wt, WeeklyTime(0, 4, 0))
        new_wt = Availability.new_timezone_wt(c.tuesday_1715, c.et_no_ds,
                                              'Asia/Tokyo')
        self.assertEqual(new_wt, WeeklyTime(3, 7, 15))
        new_wt = Availability.new_timezone_wt(c.saturday_2345,
                                              c.kathmandu_2017_end,
                                              'Australia/West')
        self.assertEqual(new_wt, WeeklyTime(0, 2, 0))

    def test_new_timezone_wt_shift_backward(self):
        new_wt = Availability.new_timezone_wt(c.sunday_0000, c.et_ds,
                                              'US/Arizona')
        self.assertEqual(new_wt, WeeklyTime(6, 21, 0))
        new_wt = Availability.new_timezone_wt(c.tuesday_1715, c.kabul_2000_1_1,
                                              'US/Samoa')
        self.assertEqual(new_wt, WeeklyTime(2, 1, 45))
        new_wt = Availability.new_timezone_wt(c.thursday_0630,
                                              c.chatham_ds,
                                              'Pacific/Midway')
        self.assertEqual(new_wt, WeeklyTime(3, 5, 45))

    def test_shared_course_start_times_no_overlap(self):
        times = c.never_free_avail.shared_course_start_times(c.always_free_avail)
        self.assertEqual(times, [])
        times = c.free_sat_sun_six_avail.shared_course_start_times(c.free_first_six_avail)
        self.assertEqual(times, [])
    
    def test_shared_course_start_times_overlap_one(self):
        times = c.always_free_avail.shared_course_start_times(c.free_sat_sun_six_avail)
        self.assertEqual(times, [WeeklyTime(6, 23, 15)])

    def test_shared_course_start_times_overlap_greater_than_one(self):
        times = c.always_free_avail.shared_course_start_times(c.free_first_seven_avail)
        self.assertEqual(times, [WeeklyTime(0, 0, 0), WeeklyTime(0, 0, 15)])

    def test_forward_shifted_value_error(self):
        with self.assertRaises(ValueError):
            c.always_free_avail.forward_shifted(14)

    def test_forward_shifted_always_free_avail(self):
        for i in range(-c.SLOTS_PER_WEEK-1, c.SLOTS_PER_WEEK+2):
            self.assertEqual(c.always_free_avail.forward_shifted(15*i), c.always_free_avail)

    def test_forward_shifted_never_free_avail(self):
        for i in range(-c.SLOTS_PER_WEEK-1, c.SLOTS_PER_WEEK+2):
            self.assertEqual(c.never_free_avail.forward_shifted(15*i), c.never_free_avail)

    def test_forward_shifted_free_first_six_avail_no_shift(self):
        for i in range(-1,2):
            shifted_avail = c.free_first_six_avail.forward_shifted(c.MINUTES_PER_WEEK*i)
            self.assertEqual(shifted_avail, c.free_first_six_avail)

    def test_forward_shifted_free_first_six_avail_forward(self):
        correct_shifted_avail = Availability.from_dict({'0': [['00:15', '01:45']]})
        for i in range(-1,2):
            shifted_avail = c.free_first_six_avail.forward_shifted(c.MINUTES_PER_WEEK*i + 15)
            self.assertEqual(shifted_avail, correct_shifted_avail)

    def test_forward_shifted_free_first_six_avail_backward(self):
        for i in range(-1,2):
            shifted_avail = c.free_first_six_avail.forward_shifted(c.MINUTES_PER_WEEK*i - 45)
            self.assertEqual(shifted_avail, c.free_sat_sun_six_avail)

    def test_new_timezone_value_error(self):
        with self.assertRaises(ValueError):
            c.always_free_avail.new_timezone('utc', 'UTC', c.dt_2000_1_1)
        with self.assertRaises(ValueError):
            c.always_free_avail.new_timezone('UTC', 'utc', c.dt_2000_1_1)
        with self.assertRaises(ValueError):
            c.always_free_avail.new_timezone('UTC', 'UTC', c.utc_halloween)

    def test_new_timezone_invalid_datetime(self):
        with self.assertRaises(ValueError):
            c.always_free_avail.new_timezone('UTC', 'US/Central', c.dt_us_nonexistent)
        with self.assertRaises(ValueError):
            c.always_free_avail.new_timezone('UTC', 'US/Central', c.dt_us_ambiguous)

    def test_new_timezone_same_timezone(self):
        for tz_str in pytz.all_timezones:
            for avail in [c.always_free_avail, c.never_free_avail, c.free_first_five_avail]:
                # Relies on the fact that datetime(2000, 1, 1) is valid in all timezones
                new_avail = avail.new_timezone(tz_str, tz_str, c.dt_2000_1_1)
                self.assertEqual(new_avail, avail)
   
    def test_new_timezone_midway_chatham_no_daylight_saving(self):
        # Shift forward
        new_avail = c.free_first_six_avail.new_timezone('Pacific/Midway', 
                                                        'Pacific/Chatham',
                                                        c.dt_chatham_no_ds)
        correct_avail = Availability.from_dict({'0': [['23:45', '24:00']],
                                                '1': [['00:00', '01:15']]})
        self.assertEqual(new_avail, correct_avail)

        # Shift backward
        new_avail = c.free_first_six_avail.new_timezone('Pacific/Chatham',
                                                        'Pacific/Midway', 
                                                        c.dt_chatham_no_ds)
        correct_avail = Availability.from_dict({'6': [['00:15', '01:45']]})
        self.assertEqual(new_avail, correct_avail)

    def test_new_timezone_midway_chatham_daylight_saving(self):
        # Shift forward
        new_avail = c.free_first_six_avail.new_timezone('Pacific/Midway', 
                                                        'Pacific/Chatham',
                                                        c.dt_chatham_ds)
        correct_avail = Availability.from_dict({'1': [['00:45', '02:15']]})
        self.assertEqual(new_avail, correct_avail)

        # Shift backward
        new_avail = c.free_first_six_avail.new_timezone('Pacific/Chatham',
                                                        'Pacific/Midway', 
                                                        c.dt_chatham_ds)
        correct_avail = Availability.from_dict({'5': [['23:15', '24:00']],
                                                '6': [['00:00', '00:45']]})
        self.assertEqual(new_avail, correct_avail)

    def test_new_timezone_utc_et_no_daylight_saving(self):
        # Shift forward
        new_avail = c.free_first_five_avail.new_timezone('US/Eastern', 'UTC',
                                                         c.dt_us_no_ds)
        correct_avail = Availability.from_dict({'0': [['05:00', '06:15']]})
        self.assertEqual(new_avail, correct_avail)

        # Shift backward
        new_avail = c.free_first_five_avail.new_timezone('UTC', 'US/Eastern',
                                                         c.dt_us_no_ds)
        correct_avail = Availability.from_dict({'6': [['19:00', '20:15']]})
        self.assertEqual(new_avail, correct_avail)
    
    def test_new_timezone_utc_et_daylight_saving(self):
        # Shift forward
        new_avail = c.free_first_five_avail.new_timezone('US/Eastern', 'UTC',
                                                         c.dt_us_ds)
        correct_avail = Availability.from_dict({'0': [['04:00', '05:15']]})
        self.assertEqual(new_avail, correct_avail)

        # Shift backward
        new_avail = c.free_first_five_avail.new_timezone('UTC', 'US/Eastern',
                                                         c.dt_us_ds)
        correct_avail = Availability.from_dict({'6': [['20:00', '21:15']]})
        self.assertEqual(new_avail, correct_avail)

if __name__ == '__main__':
    unittest.main()