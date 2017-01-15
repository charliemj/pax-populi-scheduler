import argparse
import ast

def escape_single_quotes(string):
	"""
	Replaces ' with \"
	"""
	return string.replace("'", "\"")

def dictionary(string):
	"""
	Converts the string to a dictionary, raises argparse.ArgumentTypeError if
	the string is not a valid dictionary string
	"""
	try:
		return ast.literal_eval(escape_single_quotes(
				string.replace("'", "\"")))
	except:
		raise argparse.ArgumentTypeError('{} is not a valid dictionary string'\
				.format(string))