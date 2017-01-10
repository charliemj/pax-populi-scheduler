import networkx as nx

"""
Performs schedule matching between students and tutors.
"""

class Scheduler:
	def __init__(self, students, tutors):
		self.students = students
		self.tutors = tutors
		self.student_nodes = ['STUDENT ' + str(i) for i in range(len(self.students))]
		self.tutor_nodes = ['TUTOR ' + str(i) for i in range(len(self.tutors))]
		self.network = None

	def create_network(self):
		# Add nodes
		self.network = nx.DiGraph()
		self.network.add_node('SOURCE')
		self.network.add_node('SINK')
		self.network.add_nodes_from(self.student_nodes)
		self.network.add_nodes_from(self.tutor_nodes)

		# Add edges
		for student_node in self.student_nodes:
			self.network.add_edge('SOURCE', student_node, capacity=1)
		for (i, student) in enumerate(self.students):
			for (j, tutor) in enumerate(self.tutors):
				if student.availability.class_intersects(tutor.availability):
					self.network.add_edge(self.student_nodes[i],
										  self.tutor_nodes[j],
										  capacity=1)
		for tutor_node in self.tutor_nodes:
			self.network.add_edge(tutor_node, 'SINK', capacity=1)

	def get_matchings(self):
		(max_flow, flow_dict) = nx.maximum_flow(self.network, 'SOURCE', 'SINK')
		

if __name__ == '__main__':
	G = nx.DiGraph()
	G.add_nodes_from(range(1,6))
	G.add_edge(1, 2, capacity=1)
	G.add_edge(1, 3, capacity=3)
	G.add_edge(1, 4, capacity=2)
	G.add_edge(3, 5, capacity=1)
	G.add_edge(4, 5, capacity=10)
	flow, F = nx.maximum_flow(G, 1, 5)
	print flow
	print F
	
	
