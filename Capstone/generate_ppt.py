"""
generate_ppt.py - EventFlow Capstone Presentation Generator
Orchestrates generation of the 13-slide PowerPoint presentation with all 5 software engineering modules.
"""
import sys
import os
from generate_ppt_with_modules import create_extended_deck

if __name__ == "__main__":
    out = sys.argv[1] if len(sys.argv) > 1 else "EventFlow_Venue_Double_Booking_Interval_Scheduling.pptx"
    output_path = os.path.abspath(out)
    create_extended_deck(output_path)
