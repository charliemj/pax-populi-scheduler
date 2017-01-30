from datetime import datetime, timedelta

import pytz

from weekly_time import WeeklyTime
from availability import Availability

# Numerical constants
SLOTS_PER_WEEK = 672
MINUTES_PER_HOUR = 60
HOURS_PER_DAY = 24
DAYS_PER_WEEK = 7
MINUTES_PER_DAY = MINUTES_PER_HOUR * HOURS_PER_DAY
MINUTES_PER_WEEK = MINUTES_PER_DAY * DAYS_PER_WEEK

# WeeklyTime objects
sunday_0000 = WeeklyTime(0, 0, 0)
sunday_0059 = WeeklyTime(0, 0, 59)
sunday_2300 = WeeklyTime(0, 23, 0)
monday_0000 = WeeklyTime(1, 0, 0)
tuesday_1715 = WeeklyTime(2, 17, 15)
thursday_0630 = WeeklyTime(4, 6, 30)
saturday_0000 = WeeklyTime(6, 0, 0)
saturday_2345 = WeeklyTime(6, 23, 45)

# Free slot boolean arrays
always_free_slots = [True for i in range(SLOTS_PER_WEEK)]
free_first_five_slots = [True if i < 5         
                              else False
                              for i in range(SLOTS_PER_WEEK)]
never_free_slots = [False for i in range(SLOTS_PER_WEEK)]
free_sat_sun_six_slots = [True if i < 3 or i >= SLOTS_PER_WEEK - 3
                               else False
                               for i in range(SLOTS_PER_WEEK)]
nonconsecutive_free_slots = [True if i == 1 or (i >= 3 and i <= 5) or i == 100
                                  else False
                                  for i in range(SLOTS_PER_WEEK)]

# Availability dicts
always_free_dict = {str(i): [['00:00', '24:00']] for i in range(7)}
never_free_dict = {}
free_sat_sun_six_dict = {'0': [['00:00', '00:45']],
                         '6': [['23:15', '24:00']]}
nonconsecutive_free_dict = {'0': [['00:15', '00:30'], ['00:45', '01:30']],
                            '1': [['01:00', '01:15']]}
free_first_five_dict = {'0': [['00:00', '01:15']]}
free_first_six_dict = {'0': [['00:00', '01:30']]}
free_first_seven_dict = {'0': [['00:00', '01:45']]}

# Availability objects
always_free_avail = Availability(always_free_slots)
never_free_avail = Availability(never_free_slots)
free_sat_sun_six_avail = Availability(free_sat_sun_six_slots)
nonconsecutive_free_avail = Availability(nonconsecutive_free_slots)
free_first_five_avail = Availability(free_first_five_slots)
free_first_six_avail = Availability.from_dict(free_first_six_dict)
free_first_seven_avail = Availability.from_dict(free_first_seven_dict)

# Timezone constants
all_tz = [pytz.timezone(tz_name) for tz_name in pytz.all_timezones]
utc = pytz.timezone('UTC')
midway = pytz.timezone('Pacific/Midway') # UTC-11:00, no daylight saving
arizona = pytz.timezone('US/Arizona') # UTC-07:00, no daylight saving
central = pytz.timezone('US/Central') # UTC-05:00 during daylight saving, UTC-06:00 without daylight saving
et = pytz.timezone('US/Eastern') # UTC-04:00 during daylight saving, UTC-05:00 without daylight saving
kabul = pytz.timezone('Asia/Kabul') # UTC+04:30, no daylight saving
kathmandu = pytz.timezone('Asia/Kathmandu') # UTC+05:45, no daylight saving
chatham = pytz.timezone('Pacific/Chatham') # UTC+13:45 during daylight saving, UTC+12:45 without daylight saving

# Naive datetimes
dt_2000_1_1 = datetime(2000, 1, 1)
dt_2001_09_10 = datetime(2001, 9, 10)
dt_2017_01_29 = datetime(2017, 1, 29)
dt_2017_01_29_0059 = datetime(2017, 1, 29, 00, 59)
dt_2017_end = datetime(2017, 12, 31, 23, 59)
dt_us_ds_start = datetime(2017, 3, 12, 2, 0)
dt_us_ds_end = datetime(2017, 11, 5, 1, 0)
dt_us_ds = datetime(2017, 3, 13, 3, 0)
dt_us_no_ds = datetime(2017, 11, 11, 2, 0)
dt_us_nonexistent = datetime(2017, 3, 12, 2, 30)
dt_us_ambiguous = datetime(2017, 11, 5, 1, 30)
dt_chatham_no_ds = datetime(2017, 4, 2, 3, 45)
dt_chatham_ds = datetime(2017, 9, 24, 3, 45)

# Aware datetimes
utc_halloween = utc.localize(datetime(2001, 10, 31, 17, 3)) 
et_ds = et.localize(dt_us_ds) 
et_no_ds = et.localize(dt_us_no_ds) 
kabul_2000_1_1 = kabul.localize(dt_2000_1_1)
kathmandu_2017_end = kathmandu.localize(dt_2017_end)
chatham_ds = chatham.localize(datetime(2018, 1, 20))