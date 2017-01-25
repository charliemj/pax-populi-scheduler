"""
Runs one round of scheduling.
"""

from user import User
from availability import Availability
from scheduler import Scheduler
from argparse

def parse_input_str(input_str):
    return (students, tutors)

def run_scheduler(input_str):
    (students, tutors) = parse_input_str(input_str)
    scheduler = Scheduler(students, tutors)
    return scheduler.match_output_to_db()

if __name__ == '__main__':
    input_str = raw_input()
    run_scheduler(input_str)
    
    parser = argparse.ArgumentParser()
    parser.add_argument("registrations", type=string_parser.parse_dictionary,
                        help="a list of unmatched registrations") 
    args = parser.parse_args()
    main(args.registrations)