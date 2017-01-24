import networkx as nx
from availability import WeeklyTime, Availability
from match import Match

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

    def get_max_flow_network(self):
        # Add nodes
        network = nx.DiGraph()
        network.add_node('SOURCE')
        network.add_node('SINK')
        network.add_nodes_from([student.ID for student in self.students])
        network.add_nodes_from([tutor.ID for tutor in self.tutors])

        # Add edges
        for student in self.students:
            network.add_edge('SOURCE', student.ID, capacity=1)
        for student in self.students:
            for tutor in self.tutors:
                if student.can_match(tutor, self.weeks_per_course):
                    network.add_edge(student.ID, tutor.ID, capacity=1)
        for tutor in self.tutors:
            network.add_edge(tutor.ID, 'SINK', capacity=1)
        return network

    def match_max_flow(self):
        (max_flow, flow_dict) = nx.maximum_flow(self.get_max_flow_network(), 'SOURCE', 'SINK')
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
    
    def match_output_to_db(self):
        student_tutor_to_matches = self.match_max_flow()
        student_tutor_to_match_dicts = {pair: map(lambda x: x.to_dict(), student_tutor_to_matches[pair])
                                        for pair in student_tutor_to_matches}
        return student_tutor_to_match_dicts

if __name__ == '__main__':
    #import matplotlib.pyplot as plt
    #nx.draw(G, pos=nx.spring_layout(G), with_labels=False)
    #nx.draw_networkx_labels(G, pos=nx.spring_layout(G))
    #plt.show()
    from user import User
    from availability import Availability
    from datetime import date
    students = []
    tutors = []
    a1 = Availability.from_dict({'0':[['23:00','24:00']], '1': [['0:00','2:30'], ['17:00', '17:15']]})
    a2 = Availability.from_dict({'4': [['0:00', '24:00']], '3': [['3:00','12:00']]})
    a3 = Availability.from_dict({'0': [['23:45', '24:00']], '1':[['0:00','12:00']]})
    a4 = Availability.from_dict({'4': [['0:00', '2:30']]})
    students.append(User('s1', 'STUDENT', 'MALE', 'NONE', a1,'Iran',1,['a','b','d'],date(2017,1,1)))
    students.append(User('s2', 'STUDENT', 'MALE', 'NONE', a2,'Iran',1,['b'],date(2015,2,2)))
    tutors.append(User('t1', 'TUTOR', 'MALE', 'NONE', a3,'Iran',1,['a','c'],date(2018,4,1)))
    tutors.append(User('t2', 'TUTOR', 'FEMALE', 'NONE', a4,'US/Eastern',1,['b'],date(2017,1,1)))
    s1, s2 = students[0], students[1]
    t1, t2 = tutors[0], tutors[1]
    s = Scheduler(students, tutors)
    d = s.match_output_to_db()
    for pair in d:
        print pair
        for match_dict in d[pair]:
            print match_dict

    