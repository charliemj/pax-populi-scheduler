"""
Runs one round of scheduling.
"""

from user import User
from scheduler import Scheduler
import argparse
import string_parser

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
        ID = user_dict['_id']
        gender = user_dict['gender'].upper()
        tz_string = user_dict['timezone']
        user_type = user_dict['role'].upper()
        user = User(ID, user_type, gender, gender_preference, availability,
                    tz_string, courses, earliest_start_date)
        if user_type == 'STUDENT':
            students.append(user)
        if user_type == 'TUTOR':
            tutors.append(user)

    # Run scheduler
    scheduler = Scheduler(students, tutors)
    schedule_dicts = scheduler.schedule_dicts_for_database()
    return schedule_dicts

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("registrations", type=string_parser.parse_dictionary,
                        help="a list of unmatched registrations") 
    args = parser.parse_args()
    return run_scheduler(args.registrations)

if __name__ == '__main__':
    print main()