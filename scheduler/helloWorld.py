import argparse
import string_parser

def main(dictionary, message, number):
	print string_parser.escape_single_quotes(str([dictionary, message, number]))


if __name__ == '__main__':
	parser = argparse.ArgumentParser()
	parser.add_argument("dictionary", type=string_parser.dictionary,
	                    help="dictionary")
	parser.add_argument("message", type=str,
	                    help="message")
	parser.add_argument("number", type=int,
	                    help="number")
	args = parser.parse_args()
	main(args.dictionary, args.message, args.number)