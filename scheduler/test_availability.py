import unittest
from availability import WeeklyTime, Availability
from datetime import datetime
import pytz

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
        self.slots_per_week = 672

        # Free slot boolean arrays
        self.always_free_slots = [True for i in range(self.slots_per_week)]
        self.free_first_five_slots = [True if i < 5         
                                      else False
                                      for i in range(self.slots_per_week)]
        self.never_free_slots = [False for i in range(self.slots_per_week)]
        self.free_sat_sun_six_slots = [True if i < 3 or i >= self.slots_per_week - 3
                                       else False
                                       for i in range(self.slots_per_week)]
        self.nonconsecutive_free_slots = [True if i == 1 or (i >= 3 and i <= 5) or i == 100
                                          else False
                                          for i in range(self.slots_per_week)]
        
        # Availability dicts
        self.always_free_dict = {str(i): [['00:00', '24:00']] for i in range(7)}
        self.free_first_five_dict = {'0': [['00:00', '01:15']]}
        self.never_free_dict = {}
        self.free_sat_sun_six_dict = {'0': [['00:00', '00:45']],
                                      '6': [['23:15', '24:00']]}
        self.nonconsecutive_free_dict = {'0': [['00:15', '00:30'], ['00:45', '01:30']],
                                         '1': [['01:00', '01:15']]}
        
        # Availability objects
        self.always_free_avail = Availability(self.always_free_slots)
        self.free_first_five_avail = Availability(self.free_first_five_slots)
        self.never_free_avail = Availability(self.never_free_slots)
        self.free_sat_sun_six_avail = Availability(self.free_sat_sun_six_slots)
        self.nonconsecutive_free_avail = Availability(self.nonconsecutive_free_slots)

        # Timezone constants
        utc = pytz.timezone('UTC')
        et = pytz.timezone('US/Eastern') # UTC-04:00 during daylight saving, UTC-05:00 without daylight saving
        kabul = pytz.timezone('Asia/Kabul') # UTC+04:30, no daylight saving
        kathmandu = pytz.timezone('Asia/Kathmandu') # UTC+05:45, no daylight saving
        
        # Naive datetimes
        self.dt_2000_1_1 = datetime(2000, 1, 1)
        self.dt_2017_end = datetime(2017, 12, 31, 23, 59)

        # Aware datetimes
        self.utc_halloween = utc.localize(datetime(2001, 10, 31, 17, 3)) 
        self.et_ds = et.localize(datetime(2017, 3, 13, 3, 0)) 
        self.et_no_ds = et.localize(datetime(2017, 11, 5, 2, 0)) 
        self.kabul_2000_1_1 = kabul.localize(self.dt_2000_1_1)
        self.kathmandu_2017_end = kathmandu.localize(self.dt_2017_end)

    def test_constants(self):
        self.assertEqual(Availability.MINUTES_PER_SLOT, 15)
        self.assertEqual(Availability.MINUTES_PER_COURSE, 90)
        self.assertEqual(Availability.SLOTS_PER_WEEK, self.slots_per_week)
        self.assertEqual(Availability.SLOT_START_TIMES[0], WeeklyTime(0,0,0))
        self.assertEqual(Availability.SLOT_START_TIMES[-1], WeeklyTime(6,23,45))
        self.assertEqual(Availability.SLOT_START_TIME_TO_INDEX[WeeklyTime(0,0,0)], 0)
        self.assertEqual(Availability.SLOT_START_TIME_TO_INDEX[WeeklyTime(6,23,45)],
                         self.slots_per_week-1)

    def test_initializer_value_error(self):
        with self.assertRaises(ValueError):
            Availability([])
        with self.assertRaises(ValueError):
            Availability([True for i in range(671)])
        with self.assertRaises(ValueError):
            Availability([True for i in range(673)])

    def test_free_course_slots_always_free_avail(self):
        self.assertEqual(self.always_free_avail.free_course_slots,
                         self.always_free_slots)

    def test_free_course_slots_free_first_five_avail(self):
        self.assertEqual(self.free_first_five_avail.free_course_slots,
                         self.never_free_slots)

    def test_free_course_slots_free_sat_sun_six_avail(self):
        free_course_slots = [True if i == self.slots_per_week - 3
                             else False
                             for i in range(self.slots_per_week)]
        self.assertEqual(self.free_sat_sun_six_avail.free_course_slots,
                         free_course_slots)

    def test_free_course_slots_nonconsecutive_free_avail(self):
        self.assertEqual(self.nonconsecutive_free_avail.free_course_slots,
                         self.never_free_slots)

    # test_str_always_free_avail

    def test_str_free_first_five_avail(self):
        avail_str = ('Sunday 00:00 - Sunday 00:15\n'
                     'Sunday 00:15 - Sunday 00:30\n'
                     'Sunday 00:30 - Sunday 00:45\n'
                     'Sunday 00:45 - Sunday 01:00\n'
                     'Sunday 01:00 - Sunday 01:15')
        self.assertEqual(str(self.free_first_five_avail), avail_str)

    def test_str_never_free_avail(self):
        self.assertEqual(str(self.never_free_avail), '')

    def test_str_free_sat_sun_six_avail(self):
        avail_str = ('Sunday 00:00 - Sunday 00:15\n'
                     'Sunday 00:15 - Sunday 00:30\n'
                     'Sunday 00:30 - Sunday 00:45\n'
                     'Saturday 23:15 - Saturday 23:30\n'
                     'Saturday 23:30 - Saturday 23:45\n'
                     'Saturday 23:45 - Sunday 00:00')
        self.assertEqual(str(self.free_sat_sun_six_avail), avail_str)

    def test_str_nonconsecutive_free_avail(self):
        avail_str = ('Sunday 00:15 - Sunday 00:30\n'
                     'Sunday 00:45 - Sunday 01:00\n'
                     'Sunday 01:00 - Sunday 01:15\n'
                     'Sunday 01:15 - Sunday 01:30\n'
                     'Monday 01:00 - Monday 01:15')
        self.assertEqual(str(self.nonconsecutive_free_avail), avail_str)

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
        self.assertEqual(Availability.parse_dict(self.always_free_dict),
                         set(range(self.slots_per_week)))

    def test_parse_dict_free_first_five_dict(self):
        self.assertEqual(Availability.parse_dict(self.free_first_five_dict),
                         set(range(5)))    

    def test_parse_dict_never_free_dict(self):
        self.assertEqual(Availability.parse_dict(self.never_free_dict),
                         set([]))

    def test_parse_dict_free_sat_sun_six_dict(self):
        self.assertEqual(Availability.parse_dict(self.free_sat_sun_six_dict),
                         {0, 1, 2, 669, 670, 671})

    def test_parse_dict_nonconsecutive_free_dict(self):
        self.assertEqual(Availability.parse_dict(self.nonconsecutive_free_dict),
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
        self.assertEqual(Availability.from_dict(self.always_free_dict),
                         self.always_free_avail)

    def test_from_dict_free_first_five_dict(self):
        self.assertEqual(Availability.from_dict(self.free_first_five_dict),
                         self.free_first_five_avail)    

    def test_from_dict_never_free_dict(self):
        self.assertEqual(Availability.from_dict(self.never_free_dict),
                         self.never_free_avail)

    def test_from_dict_free_sat_sun_six_dict(self):
        self.assertEqual(Availability.from_dict(self.free_sat_sun_six_dict),
                         self.free_sat_sun_six_avail)

    def test_from_dict_nonconsecutive_free_dict(self):
        self.assertEqual(Availability.from_dict(self.nonconsecutive_free_dict),
                         self.nonconsecutive_free_avail)

    def test_UTC_offset_minutes_value_error(self):
        with self.assertRaises(ValueError):
            Availability.UTC_offset_minutes(self.dt_2000_1_1)
        with self.assertRaises(ValueError):
            Availability.UTC_offset_minutes(self.dt_2017_end)
    
    def test_UTC_offset_minutes_neg_offset(self):
        self.assertEqual(Availability.UTC_offset_minutes(self.et_ds), -240)
        self.assertEqual(Availability.UTC_offset_minutes(self.et_no_ds), -300)

    def test_UTC_offset_minutes_no_offset(self):
        self.assertEqual(Availability.UTC_offset_minutes(self.utc_halloween), 0)
    
    def test_UTC_offset_minutes_pos_offset(self):
        self.assertEqual(Availability.UTC_offset_minutes(self.kabul_2000_1_1), 270)
        self.assertEqual(Availability.UTC_offset_minutes(self.kathmandu_2017_end), 345)

if __name__ == '__main__':
    unittest.main()