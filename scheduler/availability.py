import math
import re
from datetime import time, datetime, timedelta
import pytz

"""
Represents an immutable (day of week, time) pair.
"""
class WeeklyTime:
    DAYS_OF_WEEK = ['Sunday',
                    'Monday',
                    'Tuesday',
                    'Wednesday',
                    'Thursday',
                    'Friday',
                    'Saturday']
    DAYS_PER_WEEK = 7

    def __init__(self, day_of_week_index, hour, minute):
        """
        Args:
            day_of_week_index: An integer in range(7) representing the day of
                the week, where 0 is Sunday.
            hour: An integer in range(24) representing the hour of the day.
            minute: An integer in range(60) representing the minute.
        """
        if day_of_week_index not in range(7):
            raise ValueError('day_of_week_index must be in range(7)')
        if hour not in range(24):
            raise ValueError('hour must be in range(24)')
        if minute not in range(60):
            raise ValueError('minute must be in range(60)')
        self.day_of_week_index = day_of_week_index
        self.day_of_week = self.DAYS_OF_WEEK[day_of_week_index]
        self.hour = hour
        self.minute = minute
        self.time = time(hour, minute)

    def __str__(self):
        return self.day_of_week + ' ' + self.time.strftime('%H:%M')

    def __eq__(self, other):
        return (self.day_of_week_index == other.day_of_week_index
                and self.hour == other.hour and self.minute == other.minute)

    def __hash__(self):
        return hash((self.day_of_week_index, self.hour, self.minute))

    @classmethod
    def from_datetime(cls, dt):
        """Instantiates a WeeklyTime object from a datetime.

        Args:
            dt: A datetime.

        Returns:
            A WeeklyTime object with the same day of the week, hour, and minute
                as dt.
        """
        # 0 corresponds to Monday in .weekday()
        day_of_week_index = (dt.weekday() + 1) % cls.DAYS_PER_WEEK
        return cls(day_of_week_index, dt.hour, dt.minute)

    def first_datetime_after(self, dt):
        """Computes the first datetime that matches self that is greater or
        equal to an input datetime. 

        Args:
            dt: A datetime.

        Returns:
            The first datetime with the same (day of week, hour, minute) as
                self that is greater or equal to dt.
        """
        # 0 corresponds to Monday in .weekday()
        input_day_of_week_index = (dt.weekday() + 1) % self.DAYS_PER_WEEK
        # If input datetime is same day of week as self, then output datetime
        # is either 0 or 7 days after input datetime
        if input_day_of_week_index == self.day_of_week_index:
            if self.time >= dt.time():
                first_datetime = datetime.combine(dt.date(), self.time)
            else:
                first_datetime = datetime.combine(dt.date() + timedelta(days=self.DAYS_PER_WEEK),
                                                  self.time)
        # If input datetime is not the same day of week as self, then take the
        # difference between the day of the week index of self and day of week
        # index of the input datetime mod 7 to find the number of days to add
        # to the input datetime 
        else:
            shift_days = (self.day_of_week_index - input_day_of_week_index) % self.DAYS_PER_WEEK
            first_datetime = datetime.combine(dt.date() + timedelta(days=shift_days),
                                              self.time)
        return first_datetime

"""
Represents a weekly availability.
"""
class Availability:
    DAYS_PER_WEEK = 7
    HOURS_PER_DAY = 24
    MINUTES_PER_HOUR = 60
    MINUTES_PER_WEEK = DAYS_PER_WEEK * HOURS_PER_DAY * MINUTES_PER_HOUR
    MINUTES_PER_SLOT = 15
    if MINUTES_PER_HOUR % MINUTES_PER_SLOT != 0:
        raise ValueError('MINUTES_PER_SLOT must be a divisor of 60')
    SLOTS_PER_HOUR = MINUTES_PER_HOUR / MINUTES_PER_SLOT
    SLOTS_PER_DAY = SLOTS_PER_HOUR * HOURS_PER_DAY
    SLOTS_PER_WEEK = MINUTES_PER_WEEK / MINUTES_PER_SLOT
    MINUTES_PER_COURSE = 90
    SLOTS_PER_COURSE = int(math.ceil(MINUTES_PER_COURSE / float(MINUTES_PER_SLOT)))
    SLOT_START_TIMES = []
    for day in range(DAYS_PER_WEEK):
        for hour in range(HOURS_PER_DAY):
            for k in range(SLOTS_PER_HOUR):
                SLOT_START_TIMES.append(WeeklyTime(day, hour, k*MINUTES_PER_SLOT))
    SLOT_START_TIME_TO_INDEX = {}
    for i in range(SLOTS_PER_WEEK):
        SLOT_START_TIME_TO_INDEX[SLOT_START_TIMES[i]] = i

    def __init__(self, free_slots):
        """
        Args:
            free_slots: A boolean array of length SLOTS_PER_WEEK such that
                free_slots[i] is whether or not the user is free for the slot
                starting at SLOT_START_TIMES[i].
        """
        if len(free_slots) != self.SLOTS_PER_WEEK:
            raise ValueError('free_slots must have length SLOTS_PER_WEEK')
        self.free_slots = free_slots
        # boolean array such that i-th entry is whether or not user is free to
        # start a course at SLOT_START_TIMES[i]
        self.free_course_slots = []
        for i in range(self.SLOTS_PER_WEEK):
            is_free = all(self.free_slots[(i+j)%self.SLOTS_PER_WEEK]
                          for j in range(self.SLOTS_PER_COURSE))
            self.free_course_slots.append(is_free)
    
    def __str__(self):
        lines = []
        for i in range(self.SLOTS_PER_WEEK):
            if self.free_slots[i]:
                lines.append(str(self.SLOT_START_TIMES[i]) + ' - '
                             + str(self.SLOT_START_TIMES[(i+1)%self.SLOTS_PER_WEEK]))
        return '\n'.join(lines)

    def __eq__(self, other):
        return self.free_slots == other.free_slots

    @classmethod
    def time_str_to_index(cls, time_str):
        """Converts time string of the form 'HH:MM' to the corresponding index
        of SLOT_START_TIMES.

        Args:
            time_str: A string of the form 'HH:MM' representing a time with
                a specified hour and minute. Hour must be between 0 and 24,
                inclusive. (24 is allowed because of intervals like
                ['20:00','24:00'] exist in availability dictionaries.) Minute
                must be between 0 and 59, inclusive.

        Returns:
            An integer i such that cls.SLOT_START_TIMES[i] corresponds to
                Sunday at the time given by time_str.
        """
        if not re.match(r'[0-9][0-9]:[0-9][0-9]', time_str):
            raise ValueError('time_str must be of the form "HH:MM"') 
        hours = int(time_str.split(':')[0])
        minutes = int(time_str.split(':')[1])
        if hours not in range(cls.HOURS_PER_DAY+1):
            raise ValueError('The hour part of time_str must be in range(25)')
        if minutes not in range(cls.MINUTES_PER_HOUR):
            raise ValueError('The minute part of time_str must be in range(60)')
        return (cls.MINUTES_PER_HOUR * hours + minutes) / cls.MINUTES_PER_SLOT

    @classmethod
    def parse_dict(cls, availability_dict):
        """
        Extracts the free time slots from an availability dictionary.

        Args:
            availability_dict: A dict mapping a day of the week index expressed
                as a string to a list of lists of length two. Each internal
                list of length two is of the form [start_time, end_time], where
                start_time and end_time are the start and end times in the form
                'HH:MM' of when the user is available.

                ex. {'0': [['00:00', '02:30'], ['23:00', '24:00']],
                     '4': [['17:30', '18:00']]}
                means that the user is free 12am-2:30am Sunday, 11:30pm Sunday
                to 12am Monday, and 5:30pm-6pm on Thursday.

        Returns:
            free_slots_indices: A set of indices i such that the user is free
                during the slot starting at cls.SLOT_START_TIMES[i]
        """ 
        for day_index_str in availability_dict:
            if day_index_str not in map(str, range(cls.DAYS_PER_WEEK)):
                raise ValueError('Each key in availability_dict must be a string form of an integer in range(7)')
        free_slots_indices = set([])
        for day_string in availability_dict:
            intervals = availability_dict[day_string]
            day_slot_index = int(day_string) * cls.SLOTS_PER_DAY
            for interval in intervals:
                if len(interval) != 2:
                    raise ValueError('time interval in availability_dict must have length 2')
                start_index = day_slot_index + cls.time_str_to_index(interval[0])
                end_index = day_slot_index + cls.time_str_to_index(interval[1])
                free_slots_indices.update(range(start_index, end_index))
        return free_slots_indices

    @classmethod
    def from_dict(cls, availability_dict):
        """Instantiates an Availability object from an availability dictionary.

        Args:
            availability_dict: A dict mapping a day of the week index expressed
                as a string to a list of lists of length two. Each internal
                list of length two is of the form [start_time, end_time], where
                start_time and end_time are the start and end times in the form
                'HH:MM' of when the user is available.

                ex. {'0': [['00:00', '02:30'], ['23:00', '24:00']],
                     '4': [['17:30', '18:00']]}
                means that the user is free 12am-2:30am Sunday, 11:30pm Sunday
                to 12am Monday, and 5:30pm-6pm on Thursday.

        Returns:
            An Availability object with free slots given by the intervals in
                availability_dict.
        """
        for day_index_str in availability_dict:
            if day_index_str not in map(str, range(cls.DAYS_PER_WEEK)):
                raise ValueError('Each key in availability_dict must be a string form of an integer in range(7)')
        free_slots_indices = cls.parse_dict(availability_dict)
        free_slots = [(i in free_slots_indices) for i in range(cls.SLOTS_PER_WEEK)]
        return cls(free_slots)

    @classmethod
    def UTC_offset_minutes(cls, localized_dt):
        """Converts a localized datetime to the number of minutes offset from
        from UTC.

        Args:
            localized_dt: A localized datetime object containing a timezone.

        Returns:
            offset_minutes: An integer representing the signed number of
                minutes that localized_dt is offset from UTC.
        """
        offset_string = localized_dt.strftime('%z')
        minutes = cls.MINUTES_PER_HOUR * int(offset_string[1:3]) + int(offset_string[3:5])
        if offset_string[0] == '+':
            offset_minutes = minutes
        elif offset_string[0] == '-':
            offset_minutes = -minutes
        else:
            raise ValueError('offset_string must start with "+" or "-"')
        return offset_minutes

    @classmethod
    def new_timezone_wt(cls, wt, localized_dt, new_tz_string):
        """
        Shifts a WeeklyTime to a new timezone.

        Args:
            wt: A WeeklyTime object in SLOT_START_TIMES.
            localized_dt: A localized datetime whose timezone is the current 
                timezone of wt. Also used as the reference datetime for the
                timezone conversion.
            new_tz_string: A string representing the new time zone to shift to.
                Must be in the pytz timezone database.

        Returns:
            new_wt: A WeeklyTime object that represents wt after shifting it to
                the timezone new_tz_string.
        """
        if wt not in cls.SLOT_START_TIMES:
            raise ValueError('wt must be in SLOT_START_TIMES')
        if new_tz_string not in set(pytz.all_timezones):
            raise ValueError('new_tz must be in the pytz timezone databse')
        new_tz = pytz.timezone(new_tz_string)
        new_dt = localized_dt.astimezone(new_tz)
        forward_shift_minutes = (cls.UTC_offset_minutes(new_dt)
                                 - cls.UTC_offset_minutes(localized_dt))
        if forward_shift_minutes % cls.MINUTES_PER_SLOT != 0:
            raise ValueError('MINUTES_PER_SLOT must be a divisor of forward_shift_minutes')
        n_slots = forward_shift_minutes / cls.MINUTES_PER_SLOT
        index = cls.SLOT_START_TIME_TO_INDEX[wt]
        new_wt = cls.SLOT_START_TIMES[(index+n_slots)%cls.SLOTS_PER_WEEK]
        return new_wt

    def share_course_start(self, other_availability):
        """Returns whether or not two Availability objects are both free for
        least one course slot.

        Args:
            other_availability: An Availability object.

        Returns:
            A boolean whether or not self and other_availability are both free
                for at least one course slot.    
        """
        return any(self.free_course_slots[i] and other_availability.free_course_slots[i]
                   for i in range(self.SLOTS_PER_WEEK))

    def shared_course_start_indices(self, other_availability):
        """Computes indices of self.SLOT_START_TIMES during which both
        Availability objects are free to start a course.

        Args:
            other_availability: An Availability object.

        Returns:
            A list of indices into self.SLOT_START_TIMES for which self and
                other_availability are both free to start a course.
        """
        return [i for i in range(self.SLOTS_PER_WEEK)
                if self.free_course_slots[i] and other_availability.free_course_slots[i]]

    def shared_course_start_times(self, other_availability):
        """Computes weekly times during which both Availability objects are
        free to start a course.

        Args:
            other_availability: An Availability object.

        Returns:
            A list of WeeklyTime objects during which self and
                other_availability are both free to start a course.
        """
        return [self.SLOT_START_TIMES[i] for i in range(self.SLOTS_PER_WEEK)
                if self.free_course_slots[i] and other_availability.free_course_slots[i]]

    def forward_shifted(self, forward_shift_minutes):
        """
        Returns a copy of self shifted forward in time.

        Args:
            forward_shift_minutes: An integer representing the number of
                minutes to shift self forward in time. This must be a multiple
                of self.MINUTES_PER_SLOT. 

        Returns:
            shifted_availability: An Availability object representing self
                after shifting all time slots forward by forward_shift_minutes
                minutes. For example, if the user is free 1pm-2pm on Tuesday
                and forward_shift_minutes == 75, then the returned Availability
                object will be free 2:15pm-3:15pm on Tuesday. If the user is
                free 1pm-2pm on Tuesday and forward_shift_minutes == -60, then
                the returned Availability object will be free 12pm-1pm on
                Tuesday. 
        """
        if forward_shift_minutes % self.MINUTES_PER_SLOT != 0:
            raise ValueError('MINUTES_PER_SLOT must be a divisor of forward_shift_minutes')
        n_slots = forward_shift_minutes / self.MINUTES_PER_SLOT
        shifted_free_slots = [self.free_slots[(i-n_slots)%self.SLOTS_PER_WEEK]
                              for i in range(self.SLOTS_PER_WEEK)]
        shifted_availability = Availability(shifted_free_slots)
        return shifted_availability

    def new_timezone(self, current_tz_string, new_tz_string,
                     naive_datetime_in_new_tz):
        """Returns a copy of self after shifting to a new timezone.

        Args:
            current_tz_string: A string representing the time zone of self.
                Must be in the pytz timezone database.
            new_tz_string: A string representing the new time zone to shift to.
                Must be in the pytz timezone database.
            naive_datetime_in_new_tz: An naive datetime object that
                provides the reference time in the timezone new_tz_string with
                which to calculate UTC offsets. 
        """
        if current_tz_string not in set(pytz.all_timezones):
            raise ValueError('current_tz must be in the pytz timezone database')
        if new_tz_string not in set(pytz.all_timezones):
            raise ValueError('new_tz must be in the pytz timezone databse')
        current_tz = pytz.timezone(current_tz_string)
        new_tz = pytz.timezone(new_tz_string)
        datetime_new_tz = new_tz.localize(naive_datetime_in_new_tz)
        datetime_current_tz = datetime_new_tz.astimezone(current_tz)
        forward_shift_minutes = (self.UTC_offset_minutes(datetime_new_tz)
                                 - self.UTC_offset_minutes(datetime_current_tz))
        return self.forward_shifted(forward_shift_minutes)