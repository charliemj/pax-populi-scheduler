"""
Represents a student or tutor.
"""

class User:
	def __init__(self, user_type, availability, city, timezone):
		"""
		Args:
			user_type: A string that must be one of 'STUDENT' or 'TUTOR'.
		"""
		if user_type not in ['STUDENT', 'TUTOR']:
			raise ValueError('user_type must be "STUDENT" or "TUTOR"')
		self.user_type = user_type
		self.availability = availability
		self.city = city
		self.timezone = timezone
		
