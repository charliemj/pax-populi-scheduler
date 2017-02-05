from datetime import date, datetime, timedelta
import inspect
import pytz

from availability import Availability
from match import Match
from user import User
from weekly_time import WeeklyTime

# Numerical constants
SLOTS_PER_WEEK = 672
MINUTES_PER_HOUR = 60
HOURS_PER_DAY = 24
DAYS_PER_WEEK = 7
MINUTES_PER_DAY = MINUTES_PER_HOUR * HOURS_PER_DAY
MINUTES_PER_WEEK = MINUTES_PER_DAY * DAYS_PER_WEEK

# WeeklyTime objects
sunday_0000 = WeeklyTime(0, 0, 0)
sunday_0115 = WeeklyTime(0, 1, 15)
sunday_0215 = WeeklyTime(0, 2, 15)
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
free_0_0930_1100_dict = {'0': [['09:30', '11:00']]}

# Availability objects
always_free_avail = Availability(always_free_slots)
never_free_avail = Availability(never_free_slots)
free_sat_sun_six_avail = Availability(free_sat_sun_six_slots)
nonconsecutive_free_avail = Availability(nonconsecutive_free_slots)
free_first_five_avail = Availability(free_first_five_slots)
free_first_six_avail = Availability.from_dict(free_first_six_dict)
free_first_seven_avail = Availability.from_dict(free_first_seven_dict)
free_0_0115_0245_avail = Availability.from_dict({'0': [['01:15', '02:45']]})
free_0_0215_0345_avail = Availability.from_dict({'0': [['02:15', '03:45']]})
free_0_0830_1000_avail = Availability.from_dict({'0': [['08:30', '10:00']]})
free_0_0930_1100_avail = Availability.from_dict(free_0_0930_1100_dict)


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

# Genders
genders = ['MALE', 'FEMALE']
gender_preferences = ['MALE', 'FEMALE', 'NONE']

# User __init__ arguments
user_args = set(inspect.getargspec(User.__init__)[0]) - set(['self'])

def new_user(user, arg_to_value):
    """Returns a copy of a User object after modifying some of its __init__
    arguments. Provides a fast way to create User objects.

    Args:
        user: A User object.
        arg_to_value: A dict mapping an __init__ argument as a string to its
            new value. The keys of this dict must be a subset of user_args.
    
    Returns:
        A User object that is equal to user after initializing with
            new args supplied in arg_to_value and with the same arguments as
            before for the other arguments.
    """
    if not set(arg_to_value.keys()).issubset(user_args):
        raise ValueError('arg_to_value keys must be a subset of user_args')
    user_input_dict = {}
    for arg in user_args:
        if arg in arg_to_value:
            user_input_dict[arg] = arg_to_value[arg]
        else:
            user_input_dict[arg] = user.__dict__[arg]
    return User(**user_input_dict)

# User objects
student = User('user1', 'reg1', 'STUDENT', 'MALE', 'NONE', free_first_six_avail,
               'US/Eastern', ['Math'], date(2018, 1, 1))
student_first_course_nonexistent = new_user(student, 
                                            {'availability': free_0_0215_0345_avail,
                                             'earliest_start_date': date(2018, 3, 11)})
student_first_course_ambiguous = new_user(student, 
                                          {'availability': free_0_0115_0245_avail,
                                           'earliest_start_date': date(2018, 11, 4)})
tutor = User('user2', 'reg2', 'TUTOR', 'MALE', 'NONE', free_0_0930_1100_avail,
             'Asia/Kabul', ['Math'], date(2018, 1, 1))
tutor_always_free = new_user(tutor, {'availability': always_free_avail})
tutor_match_ds = new_user(tutor, {'availability': free_0_0830_1000_avail})

# Match objects
match_one_week = Match(student, tutor, WeeklyTime(0, 5, 0),
                       datetime(2018, 1, 1, 5, 0), 1)
match_two_weeks = Match(student, tutor, WeeklyTime(0, 5, 0),
                        datetime(2018, 1, 1, 5, 0), 2)
match_et_ds_kabul = Match(student, tutor_match_ds, WeeklyTime(0, 4, 0),
                          datetime(2017, 5, 1, 4, 0), 2)
match_utc = Match(new_user(student, {'tz_str': 'UTC'}),
                  new_user(tutor, {'tz_str': 'UTC',
                                   'availability': free_first_six_avail}),
                  WeeklyTime(0, 0, 0),
                  datetime(2018, 1, 1),
                  2)

match_first_course_nonexistent = Match(student_first_course_nonexistent,
                                       tutor,
                                       WeeklyTime(0, 7, 15),
                                       datetime(2018, 3, 11),
                                       2)
match_first_course_ambiguous = Match(student_first_course_ambiguous,
                                     tutor,
                                     WeeklyTime(0, 5, 15),
                                     datetime(2018, 11, 4),
                                     2)

class FakeDatetime(datetime):
    """A fake replacement for datetime that can be mocked for testing. Overrides
    datetime.utcnow().
    """

    FAKE_UTC_NOW = datetime(1996, 1, 11, 6, 53)

    def __new__(cls, *args, **kwargs):
        return datetime.__new__(datetime, *args, **kwargs)

    @classmethod
    def utcnow(cls):
        return cls.FAKE_UTC_NOW
