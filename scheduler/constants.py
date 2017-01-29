import pytz

PYTZ_TIMEZONES = {pytz.timezone(tz_name) for tz_name in pytz.all_timezones_set}