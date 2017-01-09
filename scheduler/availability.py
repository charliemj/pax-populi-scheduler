import math

"""
Represents weekly availability.
"""
class Availability:
	MINUTES_PER_WEEK = 10080
	MINUTES_PER_HOUR = 60
	MINUTES_PER_SLOT = 15
	assert MINUTES_PER_HOUR % MINUTES_PER_SLOT == 0
	MINUTES_PER_CLASS = 90
	SLOTS_PER_CLASS = int(math.ceil(MINUTES_PER_CLASS / float(MINUTES_PER_SLOT)))
	SLOTS_PER_WEEK = MINUTES_PER_WEEK / MINUTES_PER_SLOT
	
	def __init__(self):
		self.slots = [] # self.slots[i] represents the i-th time slot starting at 12am Monday
		self.class_slots = []
		# boolean array, i-th entry is whether or not user is available on self.slots[i]
		self.slot_availabilities = []
		# boolean array, i-th entry is whether or not user is available for class starting at self.slots[i]
		self.class_availabilities = []
		for i in range(self.SLOTS_PER_WEEK):
			avail = all(self.slot_availabilities[(i+j)%self.SLOTS_PER_WEEK] for j in range(self.SLOTS_PER_CLASS))
			self.class_availabilities.append(avail)

if __name__ == '__main__':
	a = Availability()
	print a.slot_availabilities
	print a.class_availabilities
