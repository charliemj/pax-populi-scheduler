import pytz

"""
Represents a student or tutor.
"""

class User:
    def __init__(self, ID, user_type, gender, gender_preference, availability,
                 tz_string):
        """
        Args:
            user_type: A string that must be one of 'STUDENT' or 'TUTOR'.
            gender: A string that must be one of 'MALE' or 'FEMALE'.
            gender_preference: A string that must be one of 'MALE', 'FEMALE',
                'NONE'.
            tz_string: A string representing a timezone in the pytz database.
        """
        if user_type not in ['STUDENT', 'TUTOR']:
            raise ValueError('user_type must be "STUDENT" or "TUTOR"')
        if gender not in ['MALE', 'FEMALE']:
            raise ValueError('gender must be "MALE" or "FEMALE"')
        if gender_preference not in ['MALE', 'FEMALE', 'NONE']:
            raise ValueError('gender_preference must be "MALE", "FEMALE", or "NONE"')
        if tz_string not in set(pytz.all_timezones):
            raise ValueError('tz_string must be in the pytz timezone databse')
        self.ID = ID
        self.user_type = user_type
        self.gender = gender 
        self.gender_preference = gender_preference
        self.availability = availability
        self.tz_string = tz_string

    def shared_class_start_times(self, other_user):
        """Computes weekly times during which both users are free to start
        class.

        Args:
            other_user: A User object.

        Returns:
            A list of WeeklyTime objects during which self and other_user are
                both free to start class.
        """
        return self.availability.shared_class_start_times(other_user.availability)

    def gender_compatible(self, other_user):
        self_satisfied = (self.gender_preference == 'NONE'
                          or self.gender_preference == other_user.gender)
        other_satisfied = (other_user.gender_preference == 'NONE'
                          or other_user.gender_preference == self.gender)
        return self_satisfied and other_satisfied

    def can_match(self, other_user):
        """
        Availability matches and gender compatible
        """
        return (self.availability.share_class_start(other_user.availability)
                and self.gender_compatible(other_user))

    def new_timezone(self, new_tz_string, unlocalized_datetime_in_new_tz):
        """Creates a copy of self after changing timezones.

        Args:
            new_tz_string: A string representing the new time zone to shift to.
                Must be in the pytz timezone database.
            unlocalized_datetime_in_new_tz: An unlocalized datetime object that
                provides the reference time in the timezone new_tz_string with
                which to calculate UTC offsets.

        Returns:
            new_user: A User object that is the same as self after changing the
                timezone to new_tz_string.
        """
        if new_tz_string not in set(pytz.all_timezones):
            raise ValueError('new_tz must be in the pytz timezone databse')
        new_availability = self.availability.new_timezone(self.tz_string,
                                                          new_tz_string,
                                                          unlocalized_datetime_in_new_tz)
        new_user = User(self.ID, self.user_type, self.gender,
                        self.gender_preference, new_availability,
                        new_tz_string)
        return new_user



        

        
