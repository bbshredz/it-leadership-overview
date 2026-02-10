// ==================== FACILITY CALCULATOR ====================

function initFacilityCalculator() {
    const bedInput = document.getElementById('bed-count');
    const staffInput = document.getElementById('staff-count');
    
    if (!bedInput || !staffInput) return;

    function calculateCosts() {
        const beds = parseInt(bedInput.value) || 120;
        const staff = parseInt(staffInput.value) || 85;

        // Cost calculations based on facility size
        const costs = {
            network: {
                onetime: 45000 + (beds * 50),
                annual: 18000 + (beds * 20)
            },
            endpoints: {
                onetime: staff * 1200,
                annual: staff * 200
            },
            wireless: {
                onetime: 35000,
                annual: 6000
            },
            security: {
                onetime: 25000,
                annual: 12000 + (staff * 15)
            },
            licenses: {
                onetime: 0,
                annual: staff * 850
            },
            clinical: {
                onetime: 15000,
                annual: beds * 180
            },
            labor: {
                onetime: 40000,
                annual: 0
            }
        };

        const breakdown = [
            { category: 'Network Infrastructure', desc: 'Circuits, SD-WAN, switches, cabling', ...costs.network },
            { category: 'Endpoints & Devices', desc: `${staff} workstations, laptops, printers`, ...costs.endpoints },
            { category: 'Wireless Infrastructure', desc: 'Access points, controllers, site survey', ...costs.wireless },
            { category: 'Security Systems', desc: 'Firewalls, cameras, access control', ...costs.security },
            { category: 'Software Licenses', desc: 'Microsoft 365, MDM, productivity tools', ...costs.licenses },
            { category: 'Clinical Systems', desc: 'PCC setup, training, integrations', ...costs.clinical },
            { category: 'Labor & Professional Services', desc: 'Installation, configuration, testing', ...costs.labor }
        ];

        const totalOnetime = breakdown.reduce((sum, item) => sum + item.onetime, 0);
        const totalAnnual = breakdown.reduce((sum, item) => sum + item.annual, 0);

        // Update total display
        document.getElementById('total-estimate').textContent = 
            `$${((totalOnetime + totalAnnual) / 1000).toFixed(0)}K`;

        // Update table
        const tbody = document.getElementById('facility-cost-breakdown');
        tbody.innerHTML = breakdown.map(item => `
            <tr>
                <td class="budget-category">${item.category}</td>
                <td>${item.desc}</td>
                <td>$${(item.onetime / 1000).toFixed(1)}K</td>
                <td>$${(item.annual / 1000).toFixed(1)}K</td>
            </tr>
        `).join('') + `
            <tr class="budget-total-row">
                <td colspan="2">TOTAL COST</td>
                <td>$${(totalOnetime / 1000).toFixed(1)}K</td>
                <td>$${(totalAnnual / 1000).toFixed(1)}K</td>
            </tr>
        `;
    }

    bedInput.addEventListener('input', calculateCosts);
    staffInput.addEventListener('input', calculateCosts);
    
    // Initial calculation
    calculateCosts();
}

// Initialize facility calculator when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFacilityCalculator);
} else {
    initFacilityCalculator();
}
