from datetime import date, datetime, timedelta
import pytz
import unittest

from availability import Availability
from match import Match
from scheduler import Scheduler
import unit_test_constants as c
from weekly_time import WeeklyTime

class TestScheduler(unittest.TestCase):
    def test_init_value_error(self):
        with self.assertRaises(ValueError):
            Scheduler([c.student, c.tutor], [c.tutor])
        with self.assertRaises(ValueError):
            Scheduler([c.student], [c.student, c.tutor])
        with self.assertRaises(ValueError):
            Scheduler([c.student, c.student_first_course_nonexistent],
                      [c.tutor])
        with self.assertRaises(ValueError):
            Scheduler([c.student], [c.tutor, c.tutor_match_ds])
        with self.assertRaises(ValueError):
            Scheduler([c.student], [c.tutor], 0)

    def test_match_max_flow_no_students_no_tutors(self):
        s = Scheduler([], [])
        student_tutor_to_matches = s.match_max_flow()
        self.assertEqual(student_tutor_to_matches, {})

    def test_match_max_flow_no_students(self):
        s = Scheduler([], [c.tutor])
        student_tutor_to_matches = s.match_max_flow()
        self.assertEqual(student_tutor_to_matches, {})

    def test_match_max_flow_no_tutors(self):
        s = Scheduler([c.student], [])
        student_tutor_to_matches = s.match_max_flow()
        self.assertEqual(student_tutor_to_matches, {})

    def test_match_max_flow_one_student_one_tutor_no_match(self):
        s = Scheduler([c.student_first_course_nonexistent],
                      [c.tutor_always_free])
        student_tutor_to_matches = s.match_max_flow()
        self.assertEqual(student_tutor_to_matches, {})        

if __name__ == '__main__':
    unittest.main()