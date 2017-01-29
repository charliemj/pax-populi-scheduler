import json

"""
Source: http://stackoverflow.com/questions/956867/how-to-get-string-objects-instead-of-unicode-ones-from-json-in-python
"""

def _byteify(data, ignore_dicts = False):
    """
    Helper function for json_loads_byteified
    """
    # if this is a unicode string, return its string representation
    if isinstance(data, unicode):
        return data.encode('utf-8')
    # if this is a list of values, return list of byteified values
    if isinstance(data, list):
        return [ _byteify(item, ignore_dicts=True) for item in data ]
    # if this is a dictionary, return dictionary of byteified keys and values
    # but only if we haven't already byteified it
    if isinstance(data, dict) and not ignore_dicts:
        return {
            _byteify(key, ignore_dicts=True): _byteify(value, ignore_dicts=True)
            for key, value in data.iteritems()
        }
    # if it's anything else, return it in its original form
    return data

def json_loads_byteified(json_text):
    """
    Converts a string representing a json object that possibly contains unicode
    strings into a dictionary that only contains ascii strings.
    """
    return _byteify(
        json.loads(json_text, object_hook=_byteify),
        ignore_dicts=True
    )