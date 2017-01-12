"""
Represents a student or tutor.
"""

class User:
    def __init__(self,
                 user_type,
                 gender,
                 gender_preference,
                 username,
                 ID,
                 availability,
                 city,
                 country):
        """
        Args:
            user_type: A string that must be one of 'STUDENT' or 'TUTOR'.
            gender: A string that must be one of 'MALE' or 'FEMALE'.
            gender_preference: A string that must be one of 'MALE', 'FEMALE',
                'NONE'.
        """
        if user_type not in ['STUDENT', 'TUTOR']:
            raise ValueError('user_type must be "STUDENT" or "TUTOR"')
        if gender not in ['MALE', 'FEMALE']:
            raise ValueError('gender must be "MALE" or "FEMALE"')
        if gender_preference not in ['MALE', 'FEMALE', 'NONE']:
            raise ValueError('gender_preference must be "MALE", "FEMALE", or "NONE"')
        self.user_type = user_type
        self.gender = gender 
        self.gender_preference = gender_preference
        self.username = username
        self.ID = ID
        self.availability = availability
        self.city = city
        self.country = country

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
    return (self.availability.class_intersects(other_user.availability)
            and self.gender_compatible(other_user)
