from enum import Enum

class Status(str, Enum):
    created = "created"
    preparing = "preparing"
    done = "done"
    delivered = "delivered"
