import networkx as nx

from match import Match

class Vertex:
    """Immutable source or sink vertex for max flow. This class was created so
    that instances of it can be used as the source and sink vertices in max
    flow instead of the strings 'SOURCE' and 'SINK', one of which could be
    equal to a student ID or tutor ID.
    """

    def __init__(self, vertex_type):
        if vertex_type not in ['SOURCE', 'SINK']:
            raise ValueError('vertex_type must be "SOURCE" or "SINK"')

class Scheduler:
    """Performs schedule matching between students and tutors."""

    def __init__(self, students, tutors, weeks_per_course=11):
        """
        Args:
            students: A list of student User objects to be matched. The
                user_id's of the union of students and tutors must be distinct.
            tutors: A list of tutor User objects to be matched. The user_id's
                of the union of students and tutors must be distinct.
            weeks_per_course: A positive integer representing the number of
                occurrences of the course, assuming the course meets once per
                week.
        """
        for student in students:
            if student.user_type != 'STUDENT':
                raise ValueError('Every user in students must have the user_type \'STUDENT\'')
        for tutor in tutors:
            if tutor.user_type != 'TUTOR':
                raise ValueError('Every user in tutors must have the user_type \'TUTOR\'')
        self.student_ids = [student.user_id for student in students]
        self.tutor_ids = [tutor.user_id for tutor in tutors]
        if len(set(self.student_ids).union(set(self.tutor_ids))) != len(self.student_ids) + len(self.tutor_ids):
            raise ValueError('The user_id\'s in the union of students and tutors must be distinct')
        if weeks_per_course <= 0:
            raise ValueError('weeks_per_course must be a positive integer')
        self.students = students
        self.tutors = tutors
        self.tutor_id_to_tutor = dict(zip(self.tutor_ids, self.tutors))
        self.weeks_per_course = weeks_per_course
        self.source = Vertex('SOURCE')
        self.sink = Vertex('SINK')

    def get_max_flow_network(self):
        # Add nodes
        network = nx.DiGraph()
        network.add_node(self.source)
        network.add_node(self.sink)
        network.add_nodes_from(self.student_ids)
        network.add_nodes_from(self.tutor_ids)

        # Add edges
        for student in self.students:
            network.add_edge(self.source, student.user_id, capacity=1)
        for student in self.students:
            for tutor in self.tutors:
                if student.can_match(tutor, self.weeks_per_course):
                    network.add_edge(student.user_id, tutor.user_id,
                                     capacity=1)
        for tutor in self.tutors:
            network.add_edge(tutor.user_id, self.sink, capacity=1)
        return network

    def match_max_flow(self):
        (max_flow, flow_dict) = nx.maximum_flow(self.get_max_flow_network(),
                                                self.source, self.sink)
        student_tutor_to_matches = {}
        for student in self.students:
            edge_dict = flow_dict[student.user_id]
            for tutor_id in edge_dict:
                flow = edge_dict[tutor_id]
                if flow == 1:
                    tutor = self.tutor_id_to_tutor[tutor_id]
                    matches = student.get_availability_matches(tutor, self.weeks_per_course)
                    student_tutor_to_matches[(student.user_id, tutor.user_id)] = matches
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
        if not all(match_dict['studentRegID'] == first_match_dict['studentRegID']
                   for match_dict in match_dicts):
            raise ValueError('Every match in matches must have the same student registration ID')
        if not all(match_dict['tutorRegID'] == first_match_dict['tutorRegID']
                   for match_dict in match_dicts):
            raise ValueError('Every match in matches must have the same tutor registration ID')
        if not all(match_dict['possibleCourses'] == first_match_dict['possibleCourses']
                   for match_dict in match_dicts):
            raise ValueError('Every match in matches must have the same possible courses')
        student_id = first_match_dict['studentID']
        tutor_id = first_match_dict['tutorID']
        student_reg_id = first_match_dict['studentRegID']
        tutor_reg_id = first_match_dict['tutorRegID']
        possible_courses = first_match_dict['possibleCourses']
        student_possible_schedules = []
        tutor_possible_schedules = []
        UTC_possible_schedules = []
        for match_dict in match_dicts:
            student_possible_schedules.append(match_dict['studentClassSchedule'])
            tutor_possible_schedules.append(match_dict['tutorClassSchedule'])
            UTC_possible_schedules.append(match_dict['UTCClassSchedule'])
        schedule_dict = {'studentID': student_id,
                         'tutorID': tutor_id,
                         'studentRegID': student_reg_id,
                         'tutorRegID': tutor_reg_id,
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