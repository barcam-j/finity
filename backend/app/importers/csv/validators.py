import csv as csv_module
import io
import re
from dataclasses import dataclass

from fastapi import File, HTTPException, UploadFile, status


@dataclass
class ParsedCsvFile:
    headers: list[str]
    data_rows: list[list[str]]
    has_header_warning: bool
    all_rows: list[list[str]]


@dataclass
class CsvText:
    text: str


async def get_csv_text(file: UploadFile = File(...)) -> CsvText:
    """Read and decode a CSV file. Used by the AI preview endpoint."""
    content = await file.read()
    return CsvText(text=content.decode('utf-8-sig'))


async def get_parsed_csv(file: UploadFile = File(...)) -> ParsedCsvFile:
    """Read, decode and structurally validate a CSV file. Used by the manual parse endpoint."""
    content = await file.read()
    text = content.decode('utf-8-sig')
    reader = csv_module.reader(io.StringIO(text))
    rows = [row for row in reader if any(cell.strip() for cell in row)]

    if not rows:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail='The file is empty.',
        )
    if len(rows) < 2:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail='The file has no data rows.',
        )

    headers = rows[0]
    data_rows = rows[1:]

    if len(headers) < 2:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=(
                'The file does not appear to be a valid CSV: only one column was detected. '
                'Make sure the file uses a consistent delimiter (comma, semicolon or tab) '
                'and that each row contains multiple columns.'
            ),
        )

    sample = data_rows[:20]
    single_column_rows = sum(1 for row in sample if len(row) < 2)
    if single_column_rows > len(sample) * 0.8:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=(
                'The file does not appear to be a valid CSV: most rows contain only one column. '
                'Make sure the file uses a consistent delimiter (comma, semicolon or tab) '
                'and that each row contains multiple columns.'
            ),
        )

    date_pattern = re.compile(r'^\d{1,4}[-/]\d{1,2}[-/]\d{2,4}$')
    has_header_warning = bool(headers and date_pattern.match(headers[0].strip()))

    return ParsedCsvFile(headers=headers, data_rows=data_rows, has_header_warning=has_header_warning, all_rows=rows)
