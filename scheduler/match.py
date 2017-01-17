import argparse
import string_parser

def main(registrations, city_capacity):
	# matches = get_matches(registrations, city_capacity) # feed into Simon's function
	# hardcoding results for now
	matches = [{'student_ID': 's1', 'UTC_class_schedule': ['2017-01-30 04:00', '2017-02-06 04:00', '2017-02-13 04:00', '2017-02-20 04:00', '2017-02-27 04:00', '2017-03-06 04:00', '2017-03-13 03:00', '2017-03-20 03:00', '2017-03-27 03:00', '2017-04-03 03:00', '2017-04-10 03:00'], 'tutor_ID': 't2', 'student_class_schedule': ['2017-01-29 23:00', '2017-02-05 23:00', '2017-02-12 23:00', '2017-02-19 23:00', '2017-02-26 23:00', '2017-03-05 23:00', '2017-03-12 23:00', '2017-03-19 23:00', '2017-03-26 23:00', '2017-04-02 23:00', '2017-04-09 23:00'], 'tutor_class_schedule': ['2017-01-30 04:00', '2017-02-06 04:00', '2017-02-13 04:00', '2017-02-20 04:00', '2017-02-27 04:00', '2017-03-06 04:00', '2017-03-13 03:00', '2017-03-20 03:00', '2017-03-27 03:00', '2017-04-03 03:00', '2017-04-10 03:00']}, {'student_ID': 's2', 'UTC_class_schedule': ['2017-01-29 20:15', '2017-02-05 20:15', '2017-02-12 20:15', '2017-02-19 20:15', '2017-02-26 20:15', '2017-03-05 20:15', '2017-03-12 20:15', '2017-03-19 20:15', '2017-03-26 19:15', '2017-04-02 19:15', '2017-04-09 19:15'], 'tutor_ID': 't1', 'student_class_schedule': ['2017-01-29 23:45', '2017-02-05 23:45', '2017-02-12 23:45', '2017-02-19 23:45', '2017-02-26 23:45', '2017-03-05 23:45', '2017-03-12 23:45', '2017-03-19 23:45', '2017-03-26 23:45', '2017-04-02 23:45', '2017-04-09 23:45'], 'tutor_class_schedule': ['2017-01-29 23:45', '2017-02-05 23:45', '2017-02-12 23:45', '2017-02-19 23:45', '2017-02-26 23:45', '2017-03-05 23:45', '2017-03-12 23:45', '2017-03-19 23:45', '2017-03-26 23:45', '2017-04-02 23:45', '2017-04-09 23:45']}]
	for match in matches:
		print string_parser.escape_single_quotes(str(match))


if __name__ == '__main__':
	parser = argparse.ArgumentParser()
	parser.add_argument("registrations", type=string_parser.parse_dictionary,
	                    help="a list of unmatched registrations")
	parser.add_argument("city_capacity", type=string_parser.parse_dictionary,
	                    help="dictionary mapping each city to its current capacity")
	args = parser.parse_args()
	main(args.registrations, args.city_capacity)
