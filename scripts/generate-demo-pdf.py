from pathlib import Path
from reportlab.lib.colors import HexColor, white
from reportlab.lib.pagesizes import A5
from reportlab.pdfgen import canvas
from pypdf import PdfReader, PdfWriter

ROOT = Path(__file__).resolve().parents[1]
BOOKS = ROOT / "books"
FULL_PATH = BOOKS / "sample-book.pdf"
PREVIEW_PATH = BOOKS / "sample-book-preview.pdf"

WIDTH, HEIGHT = A5
INK = HexColor("#171A21")
COPPER = HexColor("#C78962")
PAPER = HexColor("#F6F0E7")
MUTED = HexColor("#756B61")

chapters = [
    (3, "A door left open", "The beginning of attention"),
    (13, "The useful pause", "On doing less, more deliberately"),
    (25, "Small weather", "What a day can teach us"),
    (37, "A room of one's own", "Boundaries as an invitation"),
    (47, "The shape of quiet", "A practice you can keep"),
]

body_lines = [
    "There are days when the world arrives all at once: messages, errands,",
    "small alarms, and the bright insistence of the next thing. This book",
    "begins somewhere quieter, with the moment we notice the space between",
    "one thought and the next.",
    "",
    "Quiet is not an absence. It is a room with the door left open. It gives",
    "ordinary details enough time to become visible: the cup cooling beside",
    "a notebook, the line of light beneath a door, the decision not to answer",
    "immediately.",
]


def draw_page(c, page_number):
    c.setFillColor(PAPER)
    c.rect(0, 0, WIDTH, HEIGHT, fill=1, stroke=0)
    c.setStrokeColor(HexColor("#DCCFC0"))
    c.setLineWidth(0.6)
    c.line(36, HEIGHT - 42, WIDTH - 36, HEIGHT - 42)
    c.setFillColor(MUTED)
    c.setFont("Helvetica", 7.5)
    c.drawString(36, 25, "THE SHAPE OF QUIET")
    c.drawRightString(WIDTH - 36, 25, f"{page_number:02d}")

    if page_number == 1:
        c.setFillColor(INK)
        c.rect(0, 0, WIDTH, HEIGHT, fill=1, stroke=0)
        c.setStrokeColor(COPPER)
        c.setLineWidth(1.2)
        c.rect(22, 22, WIDTH - 44, HEIGHT - 44, fill=0, stroke=1)
        c.setFillColor(COPPER)
        c.setFont("Helvetica-Bold", 8)
        c.drawString(42, HEIGHT - 66, "AETHER PRESS · SAMPLE EDITION")
        c.setFillColor(white)
        c.setFont("Times-Bold", 31)
        c.drawString(42, HEIGHT * 0.57, "The Shape")
        c.drawString(42, HEIGHT * 0.57 - 39, "of Quiet")
        c.setFillColor(HexColor("#E6D8C9"))
        c.setFont("Helvetica", 10)
        c.drawString(42, HEIGHT * 0.57 - 79, "a short book about making room")
        c.drawString(42, HEIGHT * 0.57 - 94, "for what matters")
        c.setFillColor(COPPER)
        c.setFont("Helvetica", 9)
        c.drawString(42, 54, "QUIET PAGES")
        return

    if page_number == 2:
        c.setFillColor(INK)
        c.setFont("Times-Bold", 20)
        c.drawString(50, HEIGHT - 88, "A note before you begin")
        c.setFillColor(MUTED)
        c.setFont("Helvetica", 9)
        c.drawString(50, HEIGHT - 110, "A sample publication for a slower kind of reading.")
        c.setFillColor(INK)
        c.setFont("Times-Roman", 13)
        y = HEIGHT - 170
        for line in body_lines[:4]:
            c.drawString(50, y, line)
            y -= 20
        c.setFillColor(COPPER)
        c.setFont("Helvetica-Bold", 9)
        c.drawString(50, 80, "Read the first 50 pages freely.")
        return

    chapter = next((item for item in chapters if item[0] == page_number), None)
    if chapter:
        c.setFillColor(COPPER)
        c.setFont("Helvetica-Bold", 8)
        c.drawString(50, HEIGHT - 95, f"CHAPTER {chapters.index(chapter) + 1:02d}")
        c.setFillColor(INK)
        c.setFont("Times-Bold", 24)
        c.drawString(50, HEIGHT - 145, chapter[1])
        c.setFillColor(MUTED)
        c.setFont("Helvetica-Oblique", 9)
        c.drawString(50, HEIGHT - 168, chapter[2])
        c.setStrokeColor(COPPER)
        c.setLineWidth(1.2)
        c.line(50, HEIGHT - 195, 112, HEIGHT - 195)
        return

    c.setFillColor(INK)
    c.setFont("Times-Bold", 16)
    c.drawString(50, HEIGHT - 88, "A little more room")
    c.setFillColor(MUTED)
    c.setFont("Helvetica", 8.5)
    c.drawString(50, HEIGHT - 108, "THE SHAPE OF QUIET · SAMPLE TEXT")
    c.setFillColor(INK)
    c.setFont("Times-Roman", 12)
    y = HEIGHT - 158
    for idx, line in enumerate(body_lines):
        if line:
            c.drawString(50, y, line)
        y -= 19
        if idx == 3:
            y -= 12
    c.setFillColor(COPPER)
    c.setFont("Times-Italic", 11)
    c.drawString(50, 78, "The next page is not always the next thing.")


def build_full():
    c = canvas.Canvas(str(FULL_PATH), pagesize=A5)
    c.setTitle("The Shape of Quiet — Sample Edition")
    for page in range(1, 65):
        draw_page(c, page)
        c.showPage()
    c.save()


def build_preview():
    reader = PdfReader(str(FULL_PATH))
    writer = PdfWriter()
    for page in reader.pages[:50]:
        writer.add_page(page)
    with PREVIEW_PATH.open("wb") as handle:
        writer.write(handle)


if __name__ == "__main__":
    BOOKS.mkdir(parents=True, exist_ok=True)
    build_full()
    build_preview()
    print(f"created {FULL_PATH} ({len(PdfReader(str(FULL_PATH)).pages)} pages)")
    print(f"created {PREVIEW_PATH} ({len(PdfReader(str(PREVIEW_PATH)).pages)} pages)")
