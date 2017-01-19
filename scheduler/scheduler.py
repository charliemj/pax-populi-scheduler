import networkx as nx
from datetime import datetime, timedelta
import pytz
from availability import WeeklyTime, Availability
import pulp
import itertools

"""
Represents a match between a student and a tutor.
"""
class Match:
    def __init__(self, student, tutor, class_start_wt_UTC,
                 scheduler_earliest_class_start_UTC, weeks_per_class):
        """
        Args:
            student: A student User object.
            tutor: A tutor User object.
            class_start_wt_UTC: A WeeklyTime object representing the
                time in UTC for student and tutor to hold their class.
            scheduler_earliest_class_start_UTC: A naive datetime object
                representing the earliest possible datetime in UTC for the
                first class from the scheduler point of view.
            weeks_per_class: A positive integer representing the number of
                occurrences of the class, assuming the class meets once per
                week.
        """
        self.student = student
        self.tutor = tutor
        self.shared_courses = student.shared_courses(tutor)
        self.class_start_wt_UTC = class_start_wt_UTC
        self.earliest_class_start_UTC = max(scheduler_earliest_class_start_UTC,
                                            student.get_earliest_start_dt_UTC(),
                                            tutor.get_earliest_start_dt_UTC())
        self.weeks_per_class = weeks_per_class
        (self.student_class_schedule, self.tutor_class_schedule, self.UTC_class_schedule) = self.get_class_schedules()
        print self.student.ID, self.tutor.ID, self.daylight_saving_valid(), self.class_start_wt_UTC

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

    def daylight_saving_valid(self):
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
            if not self.student.availability.free_class_slots[index]:
                return False
        for tutor_dt in self.tutor_class_schedule:
            tutor_wt = WeeklyTime.from_datetime(tutor_dt)
            index = Availability.SLOT_START_TIME_TO_INDEX[tutor_wt]
            if not self.tutor.availability.free_class_slots[index]:
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
                      'shared_courses': self.shared_courses,
                      'student_class_schedule': student_schedule_strings,
                      'tutor_class_schedule': tutor_schedule_strings,
                      'UTC_class_schedule': UTC_schedule_strings,}
        return match_dict
"""
Performs schedule matching between students and tutors.
"""
class Scheduler:
    WEEKS_PER_CLASS = 11

    def __init__(self, students, tutors, city_ID_to_capacity):
        """
        Args:
            students: A list of student User objects to be matched.
            tutors: A list of tutor User objects to be matched.
            city_ID_to_capacity: A dict that maps each city ID to a list of
                length AVAILABILITY.SLOTS_PER_WEEK whose i-th entry is the
                maximum number of users from that city that can be logged in at
                once at Availability.SLOT_START_TIMES[i] in the city's local
                time. The set of cities represented in students and tutors must
                be a subset of the keys of this dict.
        """
        self.students = students
        self.tutors = tutors
        self.city_ID_to_capacity = city_ID_to_capacity
        input_cities = set([s.city_ID for s in students] + [t.city_ID for t in tutors])
        if not input_cities.issubset(set(city_ID_to_capacity.keys())):
            raise ValueError('Cities represented in students and tutors must be a subset of the keys of city_ID_to_capacity')
        for capacity in city_ID_to_capacity.values():
            if len(capacity) != Availability.SLOTS_PER_WEEK:
                raise ValueError('Each value of the dict city_ID_to_capacity must be a list of length Availability.SLOTS_PER_WEEK')
        self.student_IDs = [student.ID for student in self.students]
        self.tutor_IDs = [tutor.ID for tutor in self.tutors]
        self.ID_to_user = dict(zip(self.student_IDs, self.students))
        self.ID_to_user.update(dict(zip(self.tutor_IDs, self.tutors)))
        # earliest start datetime of class, TODO: change 7 or make it a parameter
        self.scheduler_earliest_class_start_UTC = datetime.utcnow() + timedelta(days=7)

        # use student earliest class start as reference
        self.students_UTC = [student.new_timezone('UTC', student.get_earliest_start_dt_UTC())
                             for student in self.students]
        self.tutors_UTC = [tutor.new_timezone('UTC', tutor.get_earliest_start_dt_UTC())
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

    def match_max_flow(self):
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
                                  self.scheduler_earliest_class_start_UTC,
                                  self.WEEKS_PER_CLASS)
                    proposed_matches.append(match)
        matches = filter(lambda x: x.daylight_saving_valid(), proposed_matches)
        return matches

    def match_LP(self):
        """Maximizes the number of (student, tutor) matches using linear
        programming.

        Returns:
            matches: A list of Match objects.
        """
        # Initialize variables
        student_indices = range(len(self.students_UTC))
        tutor_indices = range(len(self.tutors_UTC))
        time_slot_indices = range(Availability.SLOTS_PER_WEEK)
        triples = list(itertools.product(student_indices, tutor_indices,
                                    time_slot_indices))
        # maps (i,j,k) to whether student i and tutor j are gender compatible
        # and they can both start a class a time slot k
        triple_is_valid = {triple: False for triple in triples}
        city_to_student_indices = {}
        for (i, student_UTC) in enumerate(self.students_UTC):
            city = student_UTC.city_ID
            if city not in city_to_student_indices.keys():
                city_to_student_indices[city] = [i]
            else:
                city_to_student_indices[city].append(i)
            for (j, tutor_UTC) in enumerate(self.tutors_UTC):
                if student_UTC.can_match(tutor_UTC):
                    for k in student_UTC.shared_class_start_indices(tutor_UTC):
                        triple_is_valid[(i,j,k)] = True
        scheduling_prob = pulp.LpProblem('Student/Tutor Scheduling', pulp.LpMaximize)

        # Create one LP variable for each (student, tutor, time slot) triple
        x = pulp.LpVariable.dicts('triple',
                                  triple_is_valid.keys(), 0, 1, pulp.LpInteger)
        
        # Set LP variables corresponding to invalid triples to 0
        for triple in triples:
            if not triple_is_valid[triple]:
                scheduling_prob += x[triple] == 0, str(triple) + ' is not valid'
        
        # Each student is in at most one class
        for i in student_indices:
            constraint_name = 'student {} in at most one class'.format(i)
            scheduling_prob += sum(x[(i,j,k)]
                                   for j in tutor_indices
                                   for k in time_slot_indices) <= 1, constraint_name

        # Each tutor is in at most one class
        for j in tutor_indices:
            constraint_name = 'tutor {} in at most one class'.format(j)
            scheduling_prob += sum(x[(i,j,k)]
                                   for i in student_indices
                                   for k in time_slot_indices) <= 1, constraint_name

        # Each student city has a maximum number of students that can be logged in at once
        for city in city_to_student_indices.keys():
            for k in time_slot_indices:
                # convert k to local time index, use new_timezone_wt, what dt should we use for reference?
                constraint_name = 'city {} at time slot {} has a maximum number students'.format(city, k)
                scheduling_prob += sum(x[(i,j,(k-m)%Availability.SLOTS_PER_WEEK)]
                                       for i in city_to_student_indices[city]
                                       for j in tutor_indices
                                       for m in range(Availability.SLOTS_PER_CLASS)) <= self.city_ID_to_capacity[city][k], constraint_name

        # Objective function
        scheduling_prob += sum(x[triple] for triple in triples), 'maximize number of matches'
        scheduling_prob.solve()

        # Recover matches from LP solution
        proposed_matches = []
        for (i,j,k) in triples:
            if int(x[(i,j,k)].value()) == 1:
                student = self.students[i]
                tutor = self.tutors[j]
                class_start_wt_UTC = Availability.SLOT_START_TIMES[k]
                match = Match(student, tutor, class_start_wt_UTC,
                                  self.scheduler_earliest_class_start_UTC,
                                  self.WEEKS_PER_CLASS)
                proposed_matches.append(match)

        # Remove matches that are no longer valid due to daylight saving
        matches = filter(lambda x: x.daylight_saving_valid(), proposed_matches)
        return matches
        
    def match_output_to_db(self, internet_constraint=True):
        if internet_constraint:
            matches = self.match_LP()
        else:
            matches = self.match_max_flow()
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
    from datetime import date
    students = []
    tutors = []
    a1 = Availability.from_dict({'0':[['23:00','24:00']], '1': [['0:00','2:30'], ['17:00', '17:15']]})
    a2 = Availability.from_dict({'4': [['0:00', '24:00']], '3': [['3:00','12:00']]})
    a3 = Availability.from_dict({'0': [['23:45', '24:00']], '1':[['0:00','12:00']]})
    a4 = Availability.from_dict({'4': [['0:00', '2:30']]})
    students.append(User('s1', 'STUDENT', 'MALE', 'NONE', a1,'Iran',1,['a','b','d'],date(2017,1,1)))
    students.append(User('s2', 'STUDENT', 'MALE', 'NONE', a2,'Iran',1,['b'],date(2015,2,2)))
    tutors.append(User('t1', 'TUTOR', 'MALE', 'NONE', a3,'Iran',1,['a','c','d'],date(2018,4,1)))
    tutors.append(User('t2', 'TUTOR', 'FEMALE', 'NONE', a4,'US/Eastern',1,['b'],date(2017,1,1)))
    s = Scheduler(students, tutors, {1:[3 for i in range(Availability.SLOTS_PER_WEEK)]})
    s1, s2 = students[0], students[1]
    t1, t2 = tutors[0], tutors[1]
    (ID_to_matched, match_dicts) = s.match_output_to_db()
    print ID_to_matched
    print match_dicts
    #matches = s.match_LP()
    #print len(matches)
    