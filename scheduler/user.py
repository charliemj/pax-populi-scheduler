from datetime import date, datetime, timedelta

import pytz

from match import Match

"""
Represents a student or tutor.
"""

class User:
    # Positive integer k such that the earliest possible start date for a
    # (student, tutor) match is max of student's earliest possible start date,
    # tutor's earliest possible start date, and current datetime plus k days.
    EARLIEST_START_DATE_OFFSET_DAYS = 7

    def __init__(self, user_id, reg_id, user_type, gender, gender_preference,
                 availability, tz_str, courses, earliest_start_date):
        """
        Args:
            user_id: A string representing the user's ID. Must uniquely identify
                a user.
            reg_id: A string representing the user's registration's ID. Must
                uniquely identify a registration.
            user_type: A string that must be one of 'STUDENT' or 'TUTOR'.
            gender: A string that must be one of 'MALE' or 'FEMALE'.
            gender_preference: A string that must be one of 'MALE', 'FEMALE',
                'NONE'.
            availability: An Availability object representing the user's weekly
                availability in his timezone.
            tz_str: A string representing a timezone in the pytz database.
            courses: A list of course names (strings) that the user can be in.
            earliest_start_date: A date object representing the earliest
                possible start date for a course in the user's timezone
                (earliest start datetime is 00:00 on earliest_start_date).
        """
        if user_type not in ['STUDENT', 'TUTOR']:
            raise ValueError('user_type must be \'STUDENT\' or \'TUTOR\'')
        if gender not in ['MALE', 'FEMALE']:
            raise ValueError('gender must be \'MALE\' or \'FEMALE\'')
        if gender_preference not in ['MALE', 'FEMALE', 'NONE']:
            raise ValueError('gender_preference must be \'MALE\', \'FEMALE\', or \'NONE\'')
        if tz_str not in pytz.all_timezones_set:
            raise ValueError('tz_str must be in the pytz timezone database')
        if (not isinstance(earliest_start_date, date)
            or isinstance(earliest_start_date, datetime)):
            raise TypeError('earliest_start_date must be a datetime.date object')
        self.user_id = user_id
        self.reg_id = reg_id
        self.user_type = user_type
        self.gender = gender 
        self.gender_preference = gender_preference
        self.availability = availability
        self.tz_str = tz_str
        self.tz = pytz.timezone(tz_str)
        self.courses = courses
        self.courses_set = set(self.courses)
        self.earliest_start_date = earliest_start_date

    def get_earliest_start_dt_UTC(self):
        """Returns a naive UTC datetime of the earliest start datetime during
        which the user can start a course.

        Returns: A naive datetime object representing the earliest datetime
            in UTC for self to start a course.
        """
        earliest_start_dt = datetime.combine(self.earliest_start_date, datetime.min.time())
        earliest_start_dt_aware = self.tz.localize(earliest_start_dt)
        earliest_start_dt_UTC = earliest_start_dt_aware.astimezone(pytz.UTC).replace(tzinfo=None)
        return earliest_start_dt_UTC

    def get_shared_earliest_start_dt_UTC(self, other_user):
        """Computes the earliest possible datetime for a course to start between
        two users. Takes the max of the earliest possible datetimes of the two
        users and current datetime plus self.EARLIEST_START_DATE_OFFSET_DAYS
        days so that both users can start and that the start date is not in the
        past.

        Args:
            other_user: A User object.

        Returns:
            A naive datetime of the earliest possible start time in UTC of a
                course between self and other_user.
        """
        return max(datetime.utcnow() + timedelta(days=self.EARLIEST_START_DATE_OFFSET_DAYS),
                   self.get_earliest_start_dt_UTC(),
                   other_user.get_earliest_start_dt_UTC())

    def share_course(self, other_user):
        """Determines whether or not two users share at least one course.

        Args:
            other_user: A User object.

        Returns:
            A boolean whether or not self and other_user share at least one
                course.
        """
        return len(self.courses_set.intersection(other_user.courses_set)) > 0

    def shared_courses(self, other_user):
        """Determines the courses shared by two users.

        Args:
            other_user: A User object.

        Returns:
            A sorted list of course names (strings) that self and other_user
                share.
        """
        shared_courses_set = self.courses_set.intersection(other_user.courses_set)
        return sorted(list(shared_courses_set))

    def gender_compatible(self, other_user):
        """Determines whether or not two users are gender compatible.

        Args:
            other_user: A User object.

        Returns:
            A boolean whether or not self's gender satisfies other_user's
                gender preference and other_user's gender satisfies self's
                gender preference.
        """
        self_satisfied = (self.gender_preference == 'NONE'
                          or self.gender_preference == other_user.gender)
        other_satisfied = (other_user.gender_preference == 'NONE'
                          or other_user.gender_preference == self.gender)
        return self_satisfied and other_satisfied

    def shared_course_slots_UTC(self, other_user):
        earliest_start_dt_UTC = self.get_shared_earliest_start_dt_UTC(other_user)
        self_availability_UTC = self.new_timezone_availability('UTC', earliest_start_dt_UTC)
        other_availability_UTC = other_user.new_timezone_availability('UTC', earliest_start_dt_UTC)
        return self_availability_UTC.shared_course_start_times(other_availability_UTC)

    def get_availability_matches(self, tutor, weeks_per_course):
        """Returns a list of potential matches between a student and a tutor
        accounting for their availabilities, their timezones, and daylight
        saving.

        Args:
            self: A student User object.
            tutor: A tutor User object.
            weeks_per_course: A positive integer representing the number of
                occurrences of the course, assuming the course meets once per
                week.

        Returns:
            matches: A list of Match objects that are valid given
                availabilities, timezone differences, and daylight saving.
        """
        if self.user_type != 'STUDENT':
            raise ValueError('self must have user_type of \'STUDENT\'');
        if tutor.user_type != 'TUTOR':
            raise ValueError('tutor must have user_type of \'TUTOR\'');
        if weeks_per_course <= 0:
            raise ValueError('weeks_per_course must be a positive integer')
        earliest_start_dt_UTC = self.get_shared_earliest_start_dt_UTC(tutor)
        matches = []
        for wt_UTC in self.shared_course_slots_UTC(tutor):
            match = Match(self, tutor, wt_UTC, earliest_start_dt_UTC,
                          weeks_per_course)
            if match.daylight_saving_valid():
                matches.append(match)
        return matches

    def availability_matches(self, tutor, weeks_per_course):
        """Determines whether or not a student and a tutor can be scheduled for
        a course based on their availabilities, timezone differences, and
        daylight saving.
        
        Args:
            self: A student User object.
            tutor: A tutor User object.
            weeks_per_course: A positive integer representing the number of
                occurrences of the course, assuming the course meets once per
                week.

        Returns:
            A boolean whether or not self and tutor can be scheduled for a
                course based on their availabilities, timezone differences, and
                daylight saving.
        """
        if self.user_type != 'STUDENT':
            raise ValueError('self must have user_type of \'STUDENT\'');
        if tutor.user_type != 'TUTOR':
            raise ValueError('tutor must have user_type of \'TUTOR\'');
        if weeks_per_course <= 0:
            raise ValueError('weeks_per_course must be a positive integer')
        return len(self.get_availability_matches(tutor, weeks_per_course)) > 0

    def can_match(self, other_user, weeks_per_course):
        """Determines whether or not two users can be matched according to the
        availability, course, and gender constraints.

        Args:
            other_user: A User object.
            weeks_per_course: A positive integer representing the number of
                occurrences of the course, assuming the course meets once per
                week.

        Returns:
            A boolean whether or not self and other_user can be matched.
                Specifically, both users must share at least one course slot,
                share at least one course, and be gender compatible.
        """
        if weeks_per_course <= 0:
            raise ValueError('weeks_per_course must be a positive integer')
        return (self.availability_matches(other_user, weeks_per_course)
                and self.share_course(other_user)
                and self.gender_compatible(other_user))

    def new_timezone_availability(self, new_tz_str, naive_dt_in_new_tz):
        """Returns a copy of self's availability in a new timezone.

        Args:
            new_tz_str: A string representing the new timezone to shift to.
                Must be in the pytz timezone database.
            naive_dt_in_new_tz: An naive datetime object that provides the
                reference time in the timezone new_tz_str with which to 
                calculate UTC offsets.

        Returns:
            new_availability: An Availability object representing
                self.availability in the timezone new_tz_str using
                naive_datetime_in_new_tz as a reference.
        """
        if new_tz_str not in pytz.all_timezones_set:
            raise ValueError('new_tz_str must be in the pytz timezone database')
        if (naive_dt_in_new_tz.tzinfo is not None
            and naive_dt_in_new_tz.tzinfo.utcoffset(naive_dt_in_new_tz) is not None):
            raise ValueError('naive_dt_in_new_tz must be a naive datetime')
        new_availability = self.availability.new_timezone(self.tz_str,
                                                          new_tz_str,
                                                          naive_dt_in_new_tz)
        return new_availability