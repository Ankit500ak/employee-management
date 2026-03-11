from records.models import UserRecord


def create_or_update_record(user, full_name, phone='', address='', dob=None, source='imported'):
    record, _ = UserRecord.objects.update_or_create(
        user=user,
        defaults={
            'full_name': full_name,
            'phone': phone,
            'address': address,
            'dob': dob,
            'source': source,
            'is_deleted': False,
        },
    )
    return record
