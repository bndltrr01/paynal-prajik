from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.units import inch
from io import BytesIO
from datetime import datetime
import base64

def generate_pdf_report(report_type, data, start_date, end_date):
    """
    Generate a PDF report using ReportLab.
    
    Args:
        report_type (str): Type of report ('occupancy', 'revenue', etc.)
        data (dict): Data to include in the report
        start_date (datetime): Start date for the report period
        end_date (datetime): End date for the report period
        
    Returns:
        BytesIO: PDF file as BytesIO object
    """
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, 
                           rightMargin=72, leftMargin=72,
                           topMargin=72, bottomMargin=72)
    
    # Create styles
    styles = getSampleStyleSheet()
    title_style = styles['Heading1']
    subtitle_style = styles['Heading2']
    normal_style = styles['Normal']
    
    # Add custom style for the footer
    footer_style = ParagraphStyle(
        'Footer',
        parent=styles['Normal'],
        fontSize=8,
        textColor=colors.gray,
        alignment=1  # Center alignment
    )
    
    # Format dates
    start_date_str = start_date.strftime('%B %d, %Y')
    end_date_str = end_date.strftime('%B %d, %Y')
    
    # Initialize elements list
    elements = []
    
    # Add title based on report type
    if report_type == 'occupancy':
        title_text = "Hotel Occupancy Report"
    elif report_type == 'revenue':
        title_text = "Hotel Revenue Report"
    elif report_type == 'bookings':
        title_text = "Hotel Bookings Report"
    elif report_type == 'guest_satisfaction':
        title_text = "Guest Satisfaction Report"
    elif report_type == 'operational':
        title_text = "Hotel Operations Report"
    else:
        title_text = f"Hotel {report_type.replace('_', ' ').title()} Report"
    
    # Add title
    elements.append(Paragraph(title_text, title_style))
    elements.append(Spacer(1, 0.25 * inch))
    elements.append(Paragraph(f"Period: {start_date_str} to {end_date_str}", subtitle_style))
    elements.append(Spacer(1, 0.25 * inch))
    
    # Add content based on report type
    if report_type == 'occupancy':
        elements.append(Paragraph("Occupancy Summary", subtitle_style))
        elements.append(Spacer(1, 0.1 * inch))
        
        # Create occupancy summary table
        occupancy_data = [
            ["Metric", "Value"],
            ["Total Rooms", data.get('total_rooms', 0)],
            ["Available Rooms", data.get('available_rooms', 0)],
            ["Occupied Rooms", data.get('occupied_rooms', 0)],
            ["Maintenance Rooms", data.get('maintenance_rooms', 0)],
            ["Current Occupancy Rate", f"{data.get('occupancy_rate', 0):.1f}%"],
        ]
        
        occupancy_table = Table(occupancy_data, colWidths=[2.5*inch, 2*inch])
        occupancy_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (1, 0), colors.lightgrey),
            ('TEXTCOLOR', (0, 0), (1, 0), colors.black),
            ('ALIGN', (0, 0), (1, 0), 'CENTER'),
            ('FONTNAME', (0, 0), (1, 0), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0, 0), (1, 0), 12),
            ('BACKGROUND', (0, 1), (1, -1), colors.white),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('ALIGN', (1, 1), (1, -1), 'RIGHT'),
        ]))
        
        elements.append(occupancy_table)
        
    elif report_type == 'revenue':
        elements.append(Paragraph("Revenue Summary", subtitle_style))
        elements.append(Spacer(1, 0.1 * inch))
        
        # Create revenue summary table
        revenue_data = [
            ["Metric", "Value"],
            ["Total Revenue", f"₱{float(data.get('total_revenue', 0)):,.2f}"],
            ["Room Revenue", f"₱{float(data.get('room_revenue', 0)):,.2f}"],
            ["Venue Revenue", f"₱{float(data.get('venue_revenue', 0)):,.2f}"],
            ["Average Daily Revenue", f"₱{float(data.get('avg_daily_revenue', 0)):,.2f}"],
            ["Revenue Per Booking", f"₱{float(data.get('revenue_per_booking', 0)):,.2f}"],
        ]
        
        revenue_table = Table(revenue_data, colWidths=[2.5*inch, 2*inch])
        revenue_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (1, 0), colors.lightgrey),
            ('TEXTCOLOR', (0, 0), (1, 0), colors.black),
            ('ALIGN', (0, 0), (1, 0), 'CENTER'),
            ('FONTNAME', (0, 0), (1, 0), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0, 0), (1, 0), 12),
            ('BACKGROUND', (0, 1), (1, -1), colors.white),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('ALIGN', (1, 1), (1, -1), 'RIGHT'),
        ]))
        
        elements.append(revenue_table)
        
    elif report_type == 'bookings':
        elements.append(Paragraph("Booking Summary", subtitle_style))
        elements.append(Spacer(1, 0.1 * inch))
        
        # Create bookings summary table
        bookings_data = [
            ["Metric", "Value"],
            ["Total Bookings", data.get('total_bookings', 0)],
            ["Active Bookings", data.get('active_bookings', 0)],
            ["Completed Bookings", data.get('completed_bookings', 0)],
            ["Cancelled Bookings", data.get('cancelled_bookings', 0)],
            ["Average Length of Stay", f"{data.get('avg_length_of_stay', 0):.1f} days"],
            ["Cancellation Rate", f"{data.get('cancellation_rate', 0):.1f}%"],
        ]
        
        bookings_table = Table(bookings_data, colWidths=[2.5*inch, 2*inch])
        bookings_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (1, 0), colors.lightgrey),
            ('TEXTCOLOR', (0, 0), (1, 0), colors.black),
            ('ALIGN', (0, 0), (1, 0), 'CENTER'),
            ('FONTNAME', (0, 0), (1, 0), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0, 0), (1, 0), 12),
            ('BACKGROUND', (0, 1), (1, -1), colors.white),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('ALIGN', (1, 1), (1, -1), 'RIGHT'),
        ]))
        
        elements.append(bookings_table)
        
    else:
        # Generic placeholder for other report types
        elements.append(Paragraph(f"This is a placeholder for the {report_type} report content.", normal_style))
    
    # Add footer
    elements.append(Spacer(1, 0.5 * inch))
    elements.append(Paragraph(f"Generated on {datetime.now().strftime('%B %d, %Y, %H:%M:%S')}", footer_style))
    
    # Build the PDF
    doc.build(elements)
    buffer.seek(0)
    
    return buffer
