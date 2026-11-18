from dataclasses import dataclass, field
from enum import Enum
from datetime import datetime
from typing import List, Optional

class PassStatus(Enum):
    ACTIVE = 'ACTIVE'
    EXPIRED = 'EXPIRED'
    REVOKED = 'REVOKED'

@dataclass
class Person:
    person_id: str
    name: str
    phone: str
    id_proof: str

@dataclass
class Student(Person):
    roll_number: str = ''
    department: str = ''

@dataclass
class Visitor(Person):
    purpose: str = ''
    host_faculty: str = ''

@dataclass
class GatePass:
    pass_id: str
    visitor: Visitor
    issue_time: datetime = field(default_factory=datetime.now)
    status: PassStatus = PassStatus.ACTIVE
    vehicle_number: Optional[str] = None

@dataclass
class SecurityOfficer:
    officer_id: str
    name: str
    gate_number: str

    def issue_gate_pass(self, visitor: Visitor, vehicle: Optional[str] = None) -> GatePass:
        return GatePass(pass_id='GP-5510', visitor=visitor, vehicle_number=vehicle)

if __name__ == '__main__':
    officer = SecurityOfficer('SEC-01', 'Ramesh Guard', 'Main Gate 1')
    vis = Visitor('V-99', 'Arun Kumar', '9876543210', 'Aadhaar: 1234-5678', 'Meeting HOD', 'Dr. Sundar')
    gp = officer.issue_gate_pass(vis, 'TN-05-AB-1234')
    print(f'Issued GatePass {gp.pass_id} for {gp.visitor.name} | Vehicle: {gp.vehicle_number} | Status: {gp.status.value}')
