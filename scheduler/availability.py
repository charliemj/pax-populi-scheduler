import math
from datetime import time

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

    def __init__(self, availability_dict):
        # boolean array, i-th entry is whether or not user is available for self.SLOT_TIMES[i]
        free_slots_indices = self.parse_dict(availability_dict)
        self.free_slots = [(i in free_slots_indices) for i in range(self.SLOTS_PER_WEEK)]
        # boolean array, i-th entry is whether or not user is available for self.CLASS_SLOT_TIMES[i]
        self.free_class_slots = []
        for i in range(self.SLOTS_PER_WEEK):
            is_free = all(self.free_slots[(i+j)%self.SLOTS_PER_WEEK] for j in range(self.SLOTS_PER_CLASS))
            self.free_class_slots.append(is_free)

        for i in range(self.SLOTS_PER_WEEK):
            if self.free_slots[i]:
                print self.SLOT_TIMES[i][0], self.SLOT_TIMES[i][1]
    
    def time_string_to_index(self, time_string):
        hours = int(time_string.split(':')[0])
        minutes = int(time_string.split(':')[1])
        return (hours * self.MINUTES_PER_HOUR + minutes) / self.MINUTES_PER_SLOT

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
