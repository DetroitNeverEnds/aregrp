import type { Meta, StoryObj } from '@storybook/react-vite';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n/config';
import { TopPartnerCard } from './TopPartnerCard';
import type { AgentPartnerOut } from '@/api/handlers/siteSettings/agents';

const mockTopPartner: AgentPartnerOut = {
    full_name: 'Алексей Смирнов',
    photo: '/panoramas/panorama-1.jpg',
    deals_count: 12,
};

const mockTopPartnerNoPhoto: AgentPartnerOut = {
    full_name: 'Мария Иванова',
    photo: null,
    deals_count: 10,
};

const meta = {
    title: 'Pages/Agents/TopPartnerCard',
    component: TopPartnerCard,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    decorators: [
        Story => (
            <I18nextProvider i18n={i18n}>
                <div style={{ width: 220 }}>
                    <Story />
                </div>
            </I18nextProvider>
        ),
    ],
} satisfies Meta<typeof TopPartnerCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        partner: mockTopPartner,
        rank: 1,
    },
};

export const NoPhoto: Story = {
    args: {
        partner: mockTopPartnerNoPhoto,
        rank: 2,
    },
};

export const TenthRank: Story = {
    args: {
        partner: {
            ...mockTopPartner,
            full_name: 'Ольга Соколова',
            deals_count: 3,
        },
        rank: 10,
    },
};
