from datetime import time, datetime, timedelta

"""
Represents an immutable (day of week, hour, minute) tuple.
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

    def __ne__(self, other):
        return (self.day_of_week_index != other.day_of_week_index
                or self.hour != other.hour or self.minute != other.minute)

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
                first_dt = datetime.combine(dt.date(), self.time)
            else:
                first_dt = datetime.combine(dt.date() + timedelta(days=self.DAYS_PER_WEEK),
                                                  self.time)
        # If input datetime is not the same day of week as self, then take the
        # difference between the day of the week index of self and day of week
        # index of the input datetime mod 7 to find the number of days to add
        # to the input datetime 
        else:
            shift_days = (self.day_of_week_index - input_day_of_week_index) % self.DAYS_PER_WEEK
            first_dt = datetime.combine(dt.date() + timedelta(days=shift_days),
                                              self.time)
        return first_dt