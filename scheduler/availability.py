import math
import pytz
import re

import util
from weekly_time import WeeklyTime

class Availability:
    """Represents a weekly availability."""

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

    def __ne__(self, other):
        return self.free_slots != other.free_slots

    @classmethod
    def time_str_to_index(cls, time_str):
        """Converts time string of the form 'HH:MM' to the corresponding index
        of SLOT_START_TIMES.

        Args:
            time_str: A string of the form 'HH:MM' representing a time with
                a specified hour and minute. Hour must be between 0 and 24,
                inclusive. (24 is allowed because of intervals like
                ['20:00','24:00'] exist in availability dictionaries.) Minute
                must be between 0 and 59, inclusive. Also the number of minutes
                elapsed between 00:00 and the time must be a multiple of 
                cls.MINUTES_PER_SLOT.

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
        total_minutes = cls.MINUTES_PER_HOUR * hours + minutes
        if total_minutes % cls.MINUTES_PER_SLOT != 0:
            raise ValueError('The number of minutes elapsed between 00:00 and time_str must be a multiple of MINUTES_PER_SLOT')
        return total_minutes / cls.MINUTES_PER_SLOT

    @classmethod
    def parse_dict(cls, availability_dict):
        """
        Extracts the free time slots from an availability dictionary.

        Args:
            availability_dict: A dict mapping a day of the week index expressed
                as a string to a list of lists of length two. Each internal
                list of length two is of the form [start_time, end_time], where
                start_time and end_time are the start and end times in the form
                'HH:MM' of when the user is available, and start_time is not
                equal to end_time. Also the number of minutes elapsed between
                00:00 and each of start_time and end_time must be a multiple of
                cls.MINUTES_PER_SLOT.

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
        for day_str in availability_dict:
            intervals = availability_dict[day_str]
            day_slot_index = int(day_str) * cls.SLOTS_PER_DAY
            for interval in intervals:
                if len(interval) != 2:
                    raise ValueError('time interval in availability_dict must have length 2')
                if interval[0] == interval[1]:
                    raise ValueError('time interval in availability_dict must have different start time and end time')
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
                'HH:MM' of when the user is available, and start_time is not
                equal to end_time. Also the number of minutes elapsed between
                00:00 and each of start_time and end_time must be a multiple of
                cls.MINUTES_PER_SLOT.

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
    def UTC_offset_minutes(cls, aware_dt):
        """Converts a timezone-aware datetime to the number of minutes offset
        from UTC.

        Args:
            aware_dt: A timezone-aware datetime.

        Returns:
            offset_minutes: An integer representing the signed number of
                minutes that aware_dt is offset from UTC.
        """
        if aware_dt.tzinfo is None or aware_dt.tzinfo.utcoffset(aware_dt) is None:
            raise ValueError('aware_dt must be a timezone-aware datetime')
        offset_str = aware_dt.strftime('%z')
        minutes = cls.MINUTES_PER_HOUR * int(offset_str[1:3]) + int(offset_str[3:5])
        if offset_str[0] == '+':
            offset_minutes = minutes
        elif offset_str[0] == '-':
            offset_minutes = -minutes
        else:
            raise ValueError('offset_str must start with "+" or "-"')
        return offset_minutes

    @classmethod
    def new_timezone_wt(cls, wt, aware_dt, new_tz_str):
        """
        Shifts a WeeklyTime to a new timezone.

        Args:
            wt: A WeeklyTime object in SLOT_START_TIMES.
            aware_dt: A timezone-aware datetime whose timezone is the
                current timezone of wt. Also used as the reference datetime for
                the timezone conversion.
            new_tz_str: A string representing the new timezone to shift to.
                Must be in the pytz timezone database.

        Returns:
            new_wt: A WeeklyTime object that represents wt after shifting it to
                the timezone new_tz_str.
        """
        if wt not in cls.SLOT_START_TIMES:
            raise ValueError('wt must be in SLOT_START_TIMES')
        if aware_dt.tzinfo is None or aware_dt.tzinfo.utcoffset(aware_dt) is None:
            raise ValueError('aware_dt must be a timezone-aware datetime')
        if new_tz_str not in pytz.all_timezones_set:
            raise ValueError('new_tz_str must be in the pytz timezone database')
        new_tz = pytz.timezone(new_tz_str)
        new_dt = aware_dt.astimezone(new_tz)
        forward_shift_minutes = (cls.UTC_offset_minutes(new_dt)
                                 - cls.UTC_offset_minutes(aware_dt))
        if forward_shift_minutes % cls.MINUTES_PER_SLOT != 0:
            raise ValueError('MINUTES_PER_SLOT must be a divisor of forward_shift_minutes')
        n_slots = forward_shift_minutes / cls.MINUTES_PER_SLOT
        index = cls.SLOT_START_TIME_TO_INDEX[wt]
        new_wt = cls.SLOT_START_TIMES[(index+n_slots)%cls.SLOTS_PER_WEEK]
        return new_wt

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
            raise ValueError('forward_shift_minutes must be a multiple of MINUTES_PER_SLOT')
        n_slots = forward_shift_minutes / self.MINUTES_PER_SLOT
        shifted_free_slots = [self.free_slots[(i-n_slots)%self.SLOTS_PER_WEEK]
                              for i in range(self.SLOTS_PER_WEEK)]
        shifted_availability = Availability(shifted_free_slots)
        return shifted_availability

    def new_timezone(self, current_tz_str, new_tz_str, naive_dt_in_new_tz):
        """Returns a copy of self after shifting to a new timezone.

        Args:
            current_tz_str: A string representing the timezone of self.
                Must be in the pytz timezone database.
            new_tz_str: A string representing the new timezone to shift to.
                Must be in the pytz timezone database.
            naive_dt_in_new_tz: An naive datetime object that provides the
                reference time in the timezone new_tz_str with which to
                calculate UTC offsets. Must be a valid (neither non-existent
                nor ambiguous) in the timezone new_tz_str.

        Returns:
            An Availability object that represents self after shifting from the
                timezone current_tz_str to the timezone new_tz_str on the
                datetime naive_dt_in_new_tz in new_tz_str.
        """
        if current_tz_str not in pytz.all_timezones_set:
            raise ValueError('current_tz_str must be in the pytz timezone database')
        if new_tz_str not in pytz.all_timezones_set:
            raise ValueError('new_tz_str must be in the pytz timezone database')
        if (naive_dt_in_new_tz.tzinfo is not None
            and naive_dt_in_new_tz.tzinfo.utcoffset(naive_dt_in_new_tz) is not None):
            raise ValueError('naive_dt_in_new_tz must be a naive datetime')
        if not util.naive_dt_is_valid(naive_dt_in_new_tz, new_tz_str):
            raise ValueError('naive_dt_in_new_tz must be a valid datetime in the timezone new_tz_str')
        current_tz = pytz.timezone(current_tz_str)
        new_tz = pytz.timezone(new_tz_str)
        dt_new_tz = new_tz.localize(naive_dt_in_new_tz)
        dt_current_tz = dt_new_tz.astimezone(current_tz)
        forward_shift_minutes = (self.UTC_offset_minutes(dt_new_tz)
                                 - self.UTC_offset_minutes(dt_current_tz))
        return self.forward_shifted(forward_shift_minutes)