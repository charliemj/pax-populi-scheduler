import networkx as nx
from datetime import datetime, timedelta
import pytz
from availability import WeeklyTime, Availability

"""
Represents a match between a student and a tutor.
"""
class Match:
    def __init__(self, student, tutor, class_start_wt_UTC,
                 earliest_class_start_UTC, weeks_per_class):
        """
        Args:
            student: A student User object.
            tutor: A tutor User object.
            class_start_wt_UTC: A WeeklyTime object representing the
                time in UTC for student and tutor to hold their class.
            earliest_class_start_UTC: An unlocalized datetime object
                representing the earliest possible datetime in UTC for the
                first class.
            weeks_per_class: A positive integer representing the number of
                occurrences of the class, assuming the class meets once per
                week.
        """
        self.student = student
        self.tutor = tutor
        self.class_start_wt_UTC = class_start_wt_UTC
        self.earliest_class_start_UTC = earliest_class_start_UTC
        self.weeks_per_class = weeks_per_class
        (self.student_class_schedule, self.tutor_class_schedule, self.UTC_class_schedule) = self.get_class_schedules()
        print self.student.ID, self.tutor.ID, self.is_valid()

    def get_class_schedules(self):
        """
        Computes the datetimes of the student's class schedule and of the
        tutor's class schedule.

        Returns:
            student_class_schedule: A list of datetimes of class start times
                localized to the student's timezone.
            tutor_class_schedule: A list of datetimes of class start times
                localized to the tutor's timezone.
            UTC_class_schedule: A list of datetimes of class start times
                localized to UTC.
        """
        localized_UTC = pytz.utc.localize(self.earliest_class_start_UTC)
        earliest_class_start_student = localized_UTC.astimezone(self.student.tz)
        student_wt = Availability.new_timezone_wt(self.class_start_wt_UTC,
                                                  localized_UTC,
                                                  self.student.tz_string)
        student_first_class_dt = student_wt.first_datetime_after(earliest_class_start_student)
        student_class_schedule_unlocalized = [student_first_class_dt
                                              + timedelta(Availability.DAYS_PER_WEEK*i)
                                              for i in range(self.weeks_per_class)]
        student_class_schedule = map(lambda x: self.student.tz.localize(x),
                                     student_class_schedule_unlocalized) 
        tutor_class_schedule = [student_dt.astimezone(self.tutor.tz)
                                for student_dt in student_class_schedule]
        UTC_class_schedule = [student_dt.astimezone(pytz.utc)
                              for student_dt in student_class_schedule]
        for (s,t, u) in zip(student_class_schedule, tutor_class_schedule, UTC_class_schedule):
            print str(s), str(t), str(u)
        return (student_class_schedule, tutor_class_schedule, UTC_class_schedule)

    def is_valid(self):
        """Determines whether or not the match is valid during all weeks of the
        schedule. Even though the match will definitely be valid on 
        earliest_class_start_UTC, it is possible that the student or tutor will
        no longer be able to make the class if daylight saving occurs for the
        student or for the tutor as the class progresses.

        Returns:
            A boolean whether or not both the student and the tutor can make
                all classes in their respective schedules.
        """
        for student_dt in self.student_class_schedule:
            student_wt = WeeklyTime.from_datetime(student_dt)
            index = Availability.SLOT_START_TIME_TO_INDEX[student_wt]
            if not self.student.availability.free_slots[index]:
                return False
        for tutor_dt in self.tutor_class_schedule:
            tutor_wt = WeeklyTime.from_datetime(tutor_dt)
            index = Availability.SLOT_START_TIME_TO_INDEX[tutor_wt]
            if not self.tutor.availability.free_slots[index]:
                return False
        return True

    def to_dict(self):
        dt_format = '%Y-%m-%d %H:%M'
        student_schedule_strings = [dt.strftime(dt_format)
                                    for dt in self.student_class_schedule]
        tutor_schedule_strings = [dt.strftime(dt_format)
                                  for dt in self.tutor_class_schedule]
        UTC_schedule_strings = [dt.strftime(dt_format)
                                for dt in self.UTC_class_schedule]    
        match_dict = {'student_ID': self.student.ID,
                      'tutor_ID': self.tutor.ID,
                      'student_class_schedule': student_schedule_strings,
                      'tutor_class_schedule': tutor_schedule_strings,
                      'UTC_class_schedule': UTC_schedule_strings,}
        return match_dict
"""
Performs schedule matching between students and tutors.
"""
class Scheduler:
    WEEKS_PER_CLASS = 11

    def __init__(self, students, tutors):
        self.students = students
        self.tutors = tutors
        self.student_IDs = [student.ID for student in self.students]
        self.tutor_IDs = [tutor.ID for tutor in self.tutors]
        self.ID_to_user = dict(zip(self.student_IDs, self.students))
        self.ID_to_user.update(dict(zip(self.tutor_IDs, self.tutors)))
        # earliest start datetime of class, TODO: change 7 or make it a parameter
        self.earliest_class_start_UTC = datetime.utcnow() + timedelta(days=7)
        self.students_UTC = [student.new_timezone('UTC', self.earliest_class_start_UTC)
                             for student in self.students]
        self.tutors_UTC = [tutor.new_timezone('UTC', self.earliest_class_start_UTC)
                             for tutor in self.tutors]
        self.ID_to_user_UTC = dict(zip(self.student_IDs, self.students_UTC))
        self.ID_to_user_UTC.update(dict(zip(self.tutor_IDs, self.tutors_UTC)))
        self.network = self.create_network()

    def create_network(self):
        # Add nodes
        network = nx.DiGraph()
        network.add_node('SOURCE')
        network.add_node('SINK')
        network.add_nodes_from(self.student_IDs)
        network.add_nodes_from(self.tutor_IDs)

        # Add edges
        for student_ID in self.student_IDs:
            network.add_edge('SOURCE', student_ID, capacity=1)
        for student_UTC in self.students_UTC:
            for tutor_UTC in self.tutors_UTC:
                if student_UTC.can_match(tutor_UTC):
                    network.add_edge(student_UTC.ID,
                                     tutor_UTC.ID,
                                     capacity=1)
        for tutor_ID in self.tutor_IDs:
            network.add_edge(tutor_ID, 'SINK', capacity=1)
        return network

    def match(self):
        (max_flow, flow_dict) = nx.maximum_flow(self.network, 'SOURCE', 'SINK')
        print max_flow
        print flow_dict
        proposed_matches = []
        for student_ID in self.student_IDs:
            edge_dict = flow_dict[student_ID]
            for tutor_ID in edge_dict.keys():
                flow = edge_dict[tutor_ID]
                if flow == 1:
                    student_UTC = self.ID_to_user_UTC[student_ID]
                    tutor_UTC = self.ID_to_user_UTC[tutor_ID]
                    class_start_wt_UTC = student_UTC.shared_class_start_times(tutor_UTC)[0]
                    student = self.ID_to_user[student_ID]
                    tutor = self.ID_to_user[tutor_ID]
                    match = Match(student, tutor, class_start_wt_UTC,
                                  self.earliest_class_start_UTC,
                                  self.WEEKS_PER_CLASS)
                    proposed_matches.append(match)
        matches = filter(lambda x: x.is_valid(), proposed_matches)
        return matches

    def match_output_to_db(self):
        matches = self.match()
        ID_to_matched = {ID: False for ID in self.ID_to_user.keys()}
        for match in matches:
            ID_to_matched[match.student.ID] = True
            ID_to_matched[match.tutor.ID] = True
        match_dicts = [match.to_dict() for match in matches]
        return (ID_to_matched, match_dicts)

if __name__ == '__main__':
    #import matplotlib.pyplot as plt
    #nx.draw(G, pos=nx.spring_layout(G), with_labels=False)
    #nx.draw_networkx_labels(G, pos=nx.spring_layout(G))
    #plt.show()
    from user import User
    from availability import Availability
    students = []
    tutors = []
    a1 = Availability.from_dict({'0':[['23:00','24:00']], '1': [['0:00','2:30'], ['17:00', '17:15']]})
    a2 = Availability.from_dict({'0': [['23:45', '24:00']], '1':[['0:00','12:00']]})
    a3 = Availability.from_dict({'0': [['23:45', '24:00']], '1': [['3:00','12:00']]})
    students.append(User('s1', 'STUDENT', 'MALE', 'NONE',a1,'US/Eastern'))
    students.append(User('s2', 'STUDENT', 'MALE', 'NONE', a1,'Iran'))
    tutors.append(User('t1', 'TUTOR', 'MALE', 'NONE', a2,'Iran'))
    tutors.append(User('t2', 'TUTOR', 'FEMALE', 'NONE', a3,'UTC'))
    s = Scheduler(students, tutors)
    (ID_to_matched, match_dicts) = s.match_output_to_db()
    print ID_to_matched
    print match_dicts
    
    