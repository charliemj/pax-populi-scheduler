import pytz

def naive_dt_is_valid(naive_dt, tz_str):
    """Considers a naive datetime invalid if it is non-existent or
    ambiguous due to daylight saving in a given timezone.

    For example, in 'US/Eastern', when daylight saving time begins, the
    minute after 1:59am is 3am, and all times in [2am, 3am) are
    non-existent. Conversely, when daylight saving ends, the minute after
    2am is 1:01am, and all times in [1am, 2am) are ambiguous because they
    occur twice.

    Args:
        naive_dt: A naive datetime.
        tz: A string representing a pytz timezone.

    Returns:
        A boolean whether or not naive_dt is valid in the timezone tz_str.
            A datetime is invalid if and only if it is non-existent or
            ambiguous.
    """
    if (naive_dt.tzinfo is not None
        and naive_dt.tzinfo.utcoffset(naive_dt) is not None):
        raise ValueError('naive_dt must be a timezone-naive datetime')
    if tz_str not in pytz.all_timezones_set:
        raise ValueError('tz_str must be in the pytz timezone database')
    tz = pytz.timezone(tz_str)
    try:
        aware_dt = tz.localize(naive_dt, is_dst=None)
    except pytz.InvalidTimeError:
        return False
    return True