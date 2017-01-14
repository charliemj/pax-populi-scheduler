import math
from datetime import time, datetime
import pytz

"""
Represents a (day of week, time) pair.
"""
class DayOfWeekTime:
    DAYS_OF_WEEK = ['Sunday',
                    'Monday',
                    'Tuesday',
                    'Wednesday',
                    'Thursday',
                    'Friday',
                    'Saturday']

    def __init__(self, day_of_week_index, hour, minute):
        if day_of_week_index not in range(7):
            raise ValueError('day_of_week_index must be in range(7)')
        if hour not in range(24):
            raise ValueError('hour must be in range(24)')
        if minute not in range(60):
            raise ValueError('minute must be in range(60)')
        self.day_of_week_index = day_of_week_index
        self.day_of_week = self.DAYS_OF_WEEK[day_of_week_index]
        self.time = time(hour, minute)

    def __str__(self):
        return self.day_of_week + ' ' + str(self.time)

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
    MINUTES_PER_CLASS = 90
    SLOTS_PER_CLASS = int(math.ceil(MINUTES_PER_CLASS / float(MINUTES_PER_SLOT)))
    SLOT_START_TIMES = []
    for day in range(DAYS_PER_WEEK):
        for hour in range(HOURS_PER_DAY):
            for k in range(SLOTS_PER_HOUR):
                SLOT_START_TIMES.append(DayOfWeekTime(day, hour, k*MINUTES_PER_SLOT))
    SLOT_TIMES = [(SLOT_START_TIMES[i], SLOT_START_TIMES[(i+1)%SLOTS_PER_WEEK])
                   for i in range(SLOTS_PER_WEEK)]
    CLASS_SLOT_TIMES = [(SLOT_START_TIMES[i],
                         SLOT_START_TIMES[(i+SLOTS_PER_CLASS)%SLOTS_PER_WEEK])
                         for i in range(SLOTS_PER_WEEK)]

    def __init__(self, availability_dict=None, free_slots=None, availability_dict_input=True):
        # boolean array, i-th entry is whether or not user is available for self.SLOT_TIMES[i]
        if availability_dict_input:
            free_slots_indices = self.parse_dict(availability_dict)
            self.free_slots = [(i in free_slots_indices) for i in range(self.SLOTS_PER_WEEK)]
        else:
            if len(free_slots) != self.SLOTS_PER_WEEK:
                raise ValueError('free_slots must have length SLOTS_PER_WEEK')
            self.free_slots = free_slots
        # boolean array, i-th entry is whether or not user is available for self.CLASS_SLOT_TIMES[i]
        self.free_class_slots = []
        for i in range(self.SLOTS_PER_WEEK):
            is_free = all(self.free_slots[(i+j)%self.SLOTS_PER_WEEK] for j in range(self.SLOTS_PER_CLASS))
            self.free_class_slots.append(is_free)
    
    def __str__(self):
        lines = []
        for i in range(self.SLOTS_PER_WEEK):
            if self.free_slots[i]:
                lines.append(str(self.SLOT_TIMES[i][0]) + ' - '
                             + str(self.SLOT_TIMES[i][1]))
        return '\n'.join(lines)

    def __eq__(self, other):
        return self.free_slots == other.free_slots

    def time_string_to_index(self, time_string):
        hours = int(time_string.split(':')[0])
        minutes = int(time_string.split(':')[1])
        return (self.MINUTES_PER_HOUR * hours  + minutes) / self.MINUTES_PER_SLOT

    def parse_dict(self, availability_dict):
        """
        Returns:
            free_slots_indices: A set of indices i such that the user is free
                during self.SLOT_TIMES[i]
        """ 
        free_slots_indices = set([])
        for day_string in availability_dict.keys():
            intervals = availability_dict[day_string]
            day_slot_index = int(day_string) * self.SLOTS_PER_DAY
            for interval in intervals:
                if len(interval) != 2:
                    raise ValueError('time interval in availability dict must have length 2')
                start_index = day_slot_index + self.time_string_to_index(interval[0])
                end_index = day_slot_index + self.time_string_to_index(interval[1])
                free_slots_indices.update(range(start_index, end_index))
        return free_slots_indices

    def class_intersect_indices(self, other_availability):
        """Computes indices of class time slots for which both users are free.

        Args:
            other_availability: An Availability object.

        Returns:
            A list of class slot indices such that self and other_availability
                are both free.
        """
        return [i for i in range(self.SLOTS_PER_WEEK)
                if self.free_class_slots[i] and other_availability.free_class_slots[i]]

    def class_intersects(self, other_availability):
        """Returns whether or not two users are both free for least one class slot.

        Args:
            other_availability: An Availability object.

        Returns:
            A boolean whether or not self and other_availability are both free
                for at least one class slot.    
        """
        return any(self.free_class_slots[i] and other_availability.free_class_slots[i]
                   for i in range(self.SLOTS_PER_WEEK))

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
        shifted_availability = Availability(free_slots=shifted_free_slots,
                                            availability_dict_input=False)
        return shifted_availability

    def UTC_offset_minutes(self, localized_datetime):
        """Converts a localized datetime to the number of minutes offset from
        from UTC.

        Args:
            localized_datetime: A localized datetime object containing a time
                zone.

        Returns:
            offset_minutes: An integer representing the signed number of
                minutes that localized_datetime is offset from UTC.
        """
        offset_string = localized_datetime.strftime('%z')
        minutes = self.MINUTES_PER_HOUR * int(offset_string[1:3]) + int(offset_string[3:5])
        if offset_string[0] == '+':
            offset_minutes = minutes
        elif offset_string[0] == '-':
            offset_minutes = -minutes
        else:
            raise ValueError('offset_string must start with "+" or "-"')
        return offset_minutes

    def new_timezone(self, current_tz_string, new_tz_string,
                     unlocalized_datetime_in_new_tz):
        """Returns a copy of self after shifting to a new timezone.

        Args:
            current_tz_string: A string representing the time zone of self.
                Must be in the pytz timezone database.
            new_tz_string: A string representing the new time zone to shift to.
                Must be in the pytz timezone database.
            unlocalized_datetime_in_new_tz: An unlocalized datetime object that
                provides the reference time in the timezone new_tz_string with
                which to calculate UTC offsets. 
        """
        if current_tz_string not in set(pytz.all_timezones):
            raise ValueError('current_tz must be in the pytz timezone database')
        if new_tz_string not in set(pytz.all_timezones):
            raise ValueError('new_tz must be in the pytz timezone databse')
        current_tz = pytz.timezone(current_tz_string)
        new_tz = pytz.timezone(new_tz_string)
        datetime_new_tz = new_tz.localize(unlocalized_datetime_in_new_tz)
        datetime_current_tz = datetime_new_tz.astimezone(current_tz)
        forward_shift_minutes = (self.UTC_offset_minutes(datetime_new_tz)
                                 - self.UTC_offset_minutes(datetime_current_tz))
        return self.forward_shifted(forward_shift_minutes)

if __name__ == '__main__':
    #a = Availability(range(5, 20))
    #a2 = Availability(range(13))
    availability_dict = {'0': [['5:00', '5:30'], ['8:00','11:00']],
                     '1': [],
                     '2': [],
                     '3': [],
                     '4': [],
                     '5': [],
                     '6': [['22:00','24:00']]}
    a = Availability(availability_dict)
    et = pytz.timezone('US/Eastern')
    cairo = pytz.timezone('Africa/Cairo')
    kat = pytz.timezone('Asia/Katmandu')
    a.new_timezone('US/Eastern', 'Australia/South', datetime(2016,4,30))