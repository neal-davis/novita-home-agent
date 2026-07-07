import docx
import argparse
from docx.opc.constants import RELATIONSHIP_TYPE as RT

def is_heading(paragraph):
    """基于中文字号判断标题级别"""
    if not paragraph.runs:
        return False, 0
    
    first_run = paragraph.runs[0]
    font_size = first_run.font.size
    
    if font_size is None:
        return False, 0
    
    size_pt = font_size.pt
    
    if size_pt >= 26:  # 一号
        return True, 1
    elif size_pt >= 18:  # 小二
        return True, 2
    elif size_pt >= 16:  # 三号
        return True, 3
    
    return False, 0

def get_hyperlink(paragraph):
    """获取段落中的超链接"""
    hyperlinks = {}
    for rel in paragraph.part.rels:
        if paragraph.part.rels[rel].reltype == RT.HYPERLINK:
            hyperlinks[rel] = paragraph.part.rels[rel]._target
    return hyperlinks

def docx_to_html(docx_path):
    doc = docx.Document(docx_path)
    html = []
    
    for para in doc.paragraphs:
        is_heading_para, heading_level = is_heading(para)
        
        if is_heading_para:
            if heading_level == 1:
                html.append(f'<h1 className={{styles.h1}}>{para.text}</h1>')
            elif heading_level == 2:
                html.append(f'<h2 className={{styles.h2}}>{para.text}</h2>')
            elif heading_level == 3:
                html.append(f'<h3 className={{styles.h3}}>{para.text}</h3>')
        else:
            # 处理段落内的加粗、斜体、下划线和超链接
            para_html = '<p className={styles.p}>'
            hyperlinks = get_hyperlink(para)
            for run in para.runs:
                text = run.text
                if run.bold:
                    text = f'<strong>{text}</strong>'
                if run.italic:
                    text = f'<em>{text}</em>'
                if run.underline:
                    text = f'<u>{text}</u>'
                
                # 检查是否有超链接
                for rel_id, target_url in hyperlinks.items():
                    if f'r:id="{rel_id}"' in run._element.xml:
                        text = f'<a href="{target_url}">{text}</a>'
                        break
                
                para_html += text
            para_html += '</p>'
            html.append(para_html)
    
    # 处理列表
    for table in doc.tables:
        html.append('<ul className={styles.ul}>')
        for row in table.rows:
            for cell in row.cells:
                html.append(f'<li>{cell.text}</li>')
        html.append('</ul>')
    
    return '\n'.join(html)

def main():
    parser = argparse.ArgumentParser(description="Convert DOCX to HTML")
    parser.add_argument("input", help="Input DOCX file")
    parser.add_argument("-o", "--output", default="output.html", help="Output HTML file (default: output.html)")
    
    args = parser.parse_args()
    
    try:
        html_output = docx_to_html(args.input)
        
        with open(args.output, 'w', encoding='utf-8') as f:
            f.write(html_output)
        
        print(f"HTML has been generated and saved to {args.output}")
    except Exception as e:
        print(f"An error occurred: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()