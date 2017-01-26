import networkx as nx
from match import Match

"""
Immutable source or sink vertex for max flow. This class was created so that
instances of it can be used as the source and sink vertex in max flow instead
of the strings 'SOURCE' and 'SINK', one of which could be equal to a student ID
or tutor ID.
"""
class Vertex:
    def __init__(self, vertex_type):
        if vertex_type not in ['SOURCE', 'SINK']:
            raise ValueError('vertex_type must be "SOURCE" or "SINK"')

"""
Performs schedule matching between students and tutors.
"""
class Scheduler:
    def __init__(self, students, tutors, weeks_per_course=11):
        """
        Args:
            students: A list of student User objects to be matched.
            tutors: A list of tutor User objects to be matched.
            weeks_per_course: A positive integer representing the number of
                occurrences of the course, assuming the course meets once per
                week.
        """
        for student in students:
            if student.user_type != 'STUDENT':
                raise ValueError('Every user in students must have the user_type "STUDENT"')
        for tutor in tutors:
            if tutor.user_type != 'TUTOR':
                raise ValueError('Every user in tutors must have the user_type "TUTOR"')
        if weeks_per_course <= 0:
            raise ValueError('weeks_per_course must be a positive integer')
        self.students = students
        self.tutors = tutors
        self.tutor_ID_to_tutor = {tutor.ID: tutor for tutor in tutors}
        self.weeks_per_course = weeks_per_course
        self.source = Vertex('SOURCE')
        self.sink = Vertex('SINK')

    def get_max_flow_network(self):
        # Add nodes
        network = nx.DiGraph()
        network.add_node(self.source)
        network.add_node(self.sink)
        network.add_nodes_from([student.ID for student in self.students])
        network.add_nodes_from([tutor.ID for tutor in self.tutors])

        # Add edges
        for student in self.students:
            network.add_edge(self.source, student.ID, capacity=1)
        for student in self.students:
            for tutor in self.tutors:
                if student.can_match(tutor, self.weeks_per_course):
                    network.add_edge(student.ID, tutor.ID, capacity=1)
        for tutor in self.tutors:
            network.add_edge(tutor.ID, self.sink, capacity=1)
        return network

    def match_max_flow(self):
        (max_flow, flow_dict) = nx.maximum_flow(self.get_max_flow_network(), self.source, self.sink)
        student_tutor_to_matches = {}
        for student in self.students:
            edge_dict = flow_dict[student.ID]
            for tutor_ID in edge_dict:
                flow = edge_dict[tutor_ID]
                if flow == 1:
                    tutor = self.tutor_ID_to_tutor[tutor_ID]
                    matches = student.get_availability_matches(tutor, self.weeks_per_course)
                    student_tutor_to_matches[(student.ID, tutor.ID)] = matches
        return student_tutor_to_matches
    
    def matches_to_schedule_dict(self, matches):
        if len(matches) == 0:
            raise ValueError('matches cannot be empty')
        match_dicts = [match.to_dict() for match in matches]
        first_match_dict = match_dicts[0]
        if not all(match_dict['studentID'] == first_match_dict['studentID']
                   for match_dict in match_dicts):
            raise ValueError('Every match in matches must have the same student ID')
        if not all(match_dict['tutorID'] == first_match_dict['tutorID']
                   for match_dict in match_dicts):
            raise ValueError('Every match in matches must have the same tutor ID')
        if not all(match_dict['possibleCourses'] == first_match_dict['possibleCourses']
                   for match_dict in match_dicts):
            raise ValueError('Every match in matches must have the same possible courses')
        student_ID = first_match_dict['studentID']
        tutor_ID = first_match_dict['tutorID']
        possible_courses = first_match_dict['possibleCourses']
        student_possible_schedules = []
        tutor_possible_schedules = []
        UTC_possible_schedules = []
        for match_dict in match_dicts:
            student_possible_schedules.append(match_dict['studentClassSchedule'])
            tutor_possible_schedules.append(match_dict['tutorClassSchedule'])
            UTC_possible_schedules.append(match_dict['UTCClassSchedule'])
        schedule_dict = {'studentID': student_ID,
                         'tutorID': tutor_ID,
                         'possibleCourses': possible_courses,
                         'studentPossibleSchedules': student_possible_schedules,
                         'tutorPossibleSchedules': tutor_possible_schedules,
                         'UTCPossibleSchedules': UTC_possible_schedules}
        return schedule_dict

    def schedule_dicts_for_database(self):
        student_tutor_to_matches = self.match_max_flow()
        schedule_dicts = [self.matches_to_schedule_dict(matches)
                          for matches in student_tutor_to_matches.values()]
        return schedule_dicts

if __name__ == '__main__':
    from user import User
    from availability import Availability
    from datetime import date
    students = []
    tutors = []
    a1 = Availability.from_dict({'0':[['23:00','24:00']], '1': [['0:00','2:30'], ['17:00', '17:15']]})
    a2 = Availability.from_dict({'4': [['0:00', '24:00']], '3': [['3:00','12:00']]})
    a3 = Availability.from_dict({'0': [['23:45', '24:00']], '1':[['0:00','12:00']]})
    a4 = Availability.from_dict({'4': [['0:00', '2:30']]})
    students.append(User('s1', 'STUDENT', 'MALE', 'NONE', a1,'Iran',['d','a'],date(2017,1,1)))
    students.append(User('s2', 'STUDENT', 'MALE', 'NONE', a2,'Iran',['b'],date(2015,2,2)))
    tutors.append(User('t1', 'TUTOR', 'MALE', 'NONE', a3,'Iran',['c','a','d'],date(2018,4,1)))
    tutors.append(User('t2', 'TUTOR', 'FEMALE', 'NONE', a4,'US/Eastern',['b', 'e'],date(2017,1,1)))
    s1, s2 = students[0], students[1]
    t1, t2 = tutors[0], tutors[1]
    s = Scheduler(students, tutors)
    for schedule_dict in s.schedule_dicts_for_database():
        print schedule_dict