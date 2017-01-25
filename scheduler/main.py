"""
Runs one round of scheduling.
"""

from user import User
from availability import Availability
from scheduler import Scheduler
import argparse

def run_scheduler(registrations):
    # Convert registrations dict to students, tutors
    students = []
    tutors = []
    for registration in registrations:
        availability = registration['availability']
        gender_preference = registration['genderPref']
        courses = registration['courses']
        earliest_start_date = registration['earliestStartTime']
        user_dict = registration['user']
        
        user = User()

    # Run scheduler
    scheduler = Scheduler(students, tutors)
    schedule_dicts = scheduler.schedule_dicts_for_database()
    return schedule_dicts

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("registrations", type=string_parser.parse_dictionary,
                        help="a list of unmatched registrations") 
    args = parser.parse_args()
    run_scheduler(args.registrations)

if __name__ == '__main__':
    main()