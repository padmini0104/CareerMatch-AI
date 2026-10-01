package career_match_api.service;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;

import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;

import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Path;

@Service
public class ResumeTextExtractorService {

    public String extractTextFromPdf(Path pdfPath)
            throws IOException {

        try (PDDocument document =
                     Loader.loadPDF(pdfPath.toFile())) {

            PDFTextStripper textStripper =
                    new PDFTextStripper();

            return textStripper
                    .getText(document)
                    .trim();
        }
    }

    public String extractTextFromDocx(Path docxPath)
            throws IOException {

        StringBuilder text = new StringBuilder();

        try (InputStream inputStream =
                     java.nio.file.Files.newInputStream(docxPath);
             XWPFDocument document =
                     new XWPFDocument(inputStream)) {

            for (XWPFParagraph paragraph :
                    document.getParagraphs()) {

                String paragraphText =
                        paragraph.getText();

                if (paragraphText != null
                        && !paragraphText.isBlank()) {

                    text.append(paragraphText)
                            .append(System.lineSeparator());
                }
            }
        }

        return text.toString().trim();
    }
}