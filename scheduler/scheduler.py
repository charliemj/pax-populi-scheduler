import networkx as nx

"""
Represents a match between a student and a tutor.
"""
class Match:
    def __init__(self, student, tutor):
        self.student = student
        self.tutor = tutor

"""
Performs schedule matching between students and tutors.
"""
class Scheduler:
    def __init__(self, students, tutors):
        self.students = students
        self.tutors = tutors
        self.student_IDs = [student.ID for student in self.students]
        self.tutor_IDs = [tutor.ID for tutor in self.tutors]
        self.ID_to_user = dict(zip(self.student_IDs, self.students))
        self.ID_to_user.update(dict(zip(self.tutor_IDs, self.tutors)))
        self.network = None

    def create_network(self):
        # Add nodes
        self.network = nx.DiGraph()
        self.network.add_node('SOURCE')
        self.network.add_node('SINK')
        self.network.add_nodes_from(self.student_IDs)
        self.network.add_nodes_from(self.tutor_IDs)

        # Add edges
        for student_ID in self.student_IDs:
            self.network.add_edge('SOURCE', student_ID, capacity=1)
        for (i, student) in enumerate(self.students):
            for (j, tutor) in enumerate(self.tutors):
                if student.can_match(tutor):
                    self.network.add_edge(self.student_IDs[i],
                                          self.tutor_IDs[j],
                                          capacity=1)
        for tutor_ID in self.tutor_IDs:
            self.network.add_edge(tutor_ID, 'SINK', capacity=1)

    def match(self):
        matched_students_IDs = set([])
        matched_tutors_IDs = set([])
        (max_flow, flow_dict) = nx.maximum_flow(self.network, 'SOURCE', 'SINK')
        matches = []
        for student_ID in self.student_IDs:
            edge_dict = flow_dict[student_ID]
            for tutor_ID in edge_dict.keys():
                flow = edge_dict[tutor_ID]
                if flow == 1:
                    matched_students_IDs.add(student_ID)
                    matched_tutors_IDs.add(tutor_ID)
                    student = self.ID_to_user[student_ID]
                    tutor = self.ID_to_user[tutor_ID]
                    matches.append(Match(student, tutor))
        unmatched_students_IDs = set(self.student_IDs) - matched_students_IDs
        unmatched_tutors_IDs = set(self.tutor_IDs) - matched_tutors_IDs
        return (matches, matched_students_IDs, matched_tutors_IDs,
                unmatched_students_IDs, unmatched_tutors_IDs)

if __name__ == '__main__':
    G = nx.DiGraph()
    G.add_nodes_from(range(1,6))
    G.add_edge(1, 2, capacity=1)
    G.add_edge(1, 3, capacity=3)
    G.add_edge(1, 4, capacity=2)
    G.add_edge(3, 5, capacity=1)
    G.add_edge(4, 5, capacity=10)
    flow, F = nx.maximum_flow(G, 1, 5)
    #import matplotlib.pyplot as plt
    #nx.draw(G, pos=nx.spring_layout(G), with_labels=False)
    #nx.draw_networkx_labels(G, pos=nx.spring_layout(G))
    #plt.show()
    print flow
    print F


    
    
