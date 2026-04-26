import footerStyles from './Footer.module.scss';
import { FooterDesktop } from './FooterDesktop';
import { FooterMobile } from './FooterMobile';

export const Footer = () => {
    return (
        <footer className={footerStyles.footer}>
            <FooterDesktop />
            <FooterMobile />
        </footer>
    );
};
