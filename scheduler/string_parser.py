import argparse
import ast

def escape_single_quotes(string):
	"""
	Replaces ' with \"
	"""
	return string.replace("'", "\"").replace('"', "\"").replace(':false', ':False')

def parse_dictionary(string):
	"""
	Converts the string to a dictionary, raises argparse.ArgumentTypeError if
	the string is not a valid dictionary string
	"""
	return ast.literal_eval(escape_single_quotes(
				string))
