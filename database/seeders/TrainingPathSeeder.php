<?php

namespace Database\Seeders;

use App\Enums\TrainingPathLevel;
use App\Enums\TrainingPathStatus;
use App\Enums\TrainingUnitType;
use App\Models\TrainingPath;
use App\Models\TrainingPathModule;
use App\Models\TrainingUnit;
use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * Seeder for trainingPaths, modules, and trainingUnits.
 * Recreates the mock data from the frontend.
 */
class TrainingPathSeeder extends Seeder
{
    public function run(): void
    {
        $instructors = [
            ['name' => 'Dr. Sarah Chen', 'email' => 'sarah.chen@example.com'],
            ['name' => 'James Rodriguez', 'email' => 'james.rodriguez@example.com'],
            ['name' => 'Dr. Emily Watson', 'email' => 'emily.watson@example.com'],
            ['name' => 'Alex Thompson', 'email' => 'alex.thompson@example.com'],
            ['name' => 'Maria Garcia', 'email' => 'maria.garcia@example.com'],
            ['name' => 'Prof. David Kim', 'email' => 'david.kim@example.com'],
        ];

        $instructorUsers = [];
        foreach ($instructors as $instructor) {
            $instructorUsers[$instructor['email']] = User::updateOrCreate(
                ['email' => $instructor['email']],
                [
                    'name' => $instructor['name'],
                    'password' => bcrypt('password'),
                    'role' => 'teacher',
                    'email_verified_at' => now(),
                ],
            );
        }

        $catalog = [
            [
                'instructor_email' => 'sarah.chen@example.com',
                'trainingPath' => [
                    'title' => 'Smart Manufacturing Operations Bootcamp',
                    'description' => 'Master connected production lines, operator dashboards, and MES-ready workflows for the modern factory.',
                    'category' => 'Smart Manufacturing',
                    'level' => TrainingPathLevel::BEGINNER,
                    'duration' => '48 hours',
                    'rating' => 4.8,
                    'has_virtual_machine' => true,
                ],
                'modules' => [
                    [
                        'title' => 'Factory Systems Fundamentals',
                        'trainingUnits' => [
                            [
                                'title' => 'Introduction to Smart Manufacturing',
                                'type' => TrainingUnitType::VIDEO->value,
                                'duration' => '15 min',
                                'content' => 'Explore how connected machines, sensors, and software keep a factory running as one coordinated system.',
                                'objectives' => ['Understand the smart factory stack', 'Identify the role of MES and SCADA', 'Explain why connected operations matter'],
                                'vm_enabled' => false,
                            ],
                            [
                                'title' => 'PLC, HMI, and SCADA',
                                'type' => TrainingUnitType::READING->value,
                                'duration' => '20 min',
                                'content' => 'Review the control layers that move from plant-floor automation to operator-facing dashboards.',
                                'objectives' => ['Distinguish PLC, HMI, and SCADA responsibilities', 'Trace operator feedback loops', 'Map control systems to production lines'],
                                'vm_enabled' => false,
                            ],
                        ],
                    ],
                    [
                        'title' => 'Production Visibility and OEE',
                        'trainingUnits' => [
                            [
                                'title' => 'Downtime and Throughput Metrics',
                                'type' => TrainingUnitType::VIDEO->value,
                                'duration' => '20 min',
                                'content' => 'Measure the health of a production line by tracking throughput, downtime, and overall equipment effectiveness.',
                                'objectives' => ['Calculate OEE', 'Track downtime causes', 'Compare machine and line performance'],
                                'vm_enabled' => false,
                            ],
                            [
                                'title' => 'Build a Production Dashboard',
                                'type' => TrainingUnitType::PRACTICE->value,
                                'duration' => '30 min',
                                'content' => 'Design a factory dashboard that surfaces production KPIs, bottlenecks, and shift summaries.',
                                'objectives' => ['Visualize line KPIs', 'Highlight bottlenecks', 'Design operator-friendly layouts'],
                                'vm_enabled' => false,
                            ],
                            [
                                'title' => 'Factory Lab: Alarm Handling',
                                'type' => TrainingUnitType::VM_LAB->value,
                                'duration' => '45 min',
                                'content' => 'Use the lab environment to triage alarms and restore normal operations in a production scenario.',
                                'objectives' => ['Investigate alarm histories', 'Resolve production interruptions', 'Practice shift handoff workflows'],
                                'vm_enabled' => true,
                            ],
                        ],
                    ],
                ],
            ],
            [
                'instructor_email' => 'james.rodriguez@example.com',
                'trainingPath' => [
                    'title' => 'Industrial IoT and Edge Connectivity',
                    'description' => 'Connect sensors, gateways, and remote assets with reliable industrial networking and edge processing.',
                    'category' => 'Industrial IoT',
                    'level' => TrainingPathLevel::INTERMEDIATE,
                    'duration' => '36 hours',
                    'rating' => 4.7,
                    'has_virtual_machine' => true,
                ],
                'modules' => [
                    [
                        'title' => 'Sensors and Gateways',
                        'trainingUnits' => [
                            [
                                'title' => 'Industrial Sensors 101',
                                'type' => TrainingUnitType::VIDEO->value,
                                'duration' => '20 min',
                                'content' => 'Learn how industrial sensors capture temperature, vibration, pressure, and other signals from equipment.',
                                'objectives' => ['Identify common industrial sensors', 'Match sensors to machine conditions', 'Understand signal quality requirements'],
                                'vm_enabled' => false,
                            ],
                            [
                                'title' => 'Connectivity Topologies',
                                'type' => TrainingUnitType::READING->value,
                                'duration' => '20 min',
                                'content' => 'Compare plant-floor connectivity patterns for wired, wireless, and hybrid deployments.',
                                'objectives' => ['Compare industrial network topologies', 'Recognize gateway placement patterns', 'Choose protocols for remote assets'],
                                'vm_enabled' => false,
                            ],
                        ],
                    ],
                    [
                        'title' => 'MQTT and Edge Messaging',
                        'trainingUnits' => [
                            [
                                'title' => 'Configuring MQTT Topics',
                                'type' => TrainingUnitType::PRACTICE->value,
                                'duration' => '30 min',
                                'content' => 'Structure MQTT topics for machines, sensors, and line-level telemetry in a clean hierarchy.',
                                'objectives' => ['Design topic hierarchies', 'Control message routing', 'Apply industrial messaging conventions'],
                                'vm_enabled' => false,
                            ],
                            [
                                'title' => 'Edge Gateway Lab',
                                'type' => TrainingUnitType::VM_LAB->value,
                                'duration' => '45 min',
                                'content' => 'Configure an edge gateway to collect telemetry and forward it to monitoring systems.',
                                'objectives' => ['Provision edge services', 'Bridge sensor data to the cloud', 'Validate telemetry flow'],
                                'vm_enabled' => true,
                            ],
                        ],
                    ],
                ],
            ],
            [
                'instructor_email' => 'emily.watson@example.com',
                'trainingPath' => [
                    'title' => 'Predictive Maintenance Analytics',
                    'description' => 'Turn vibration, temperature, and runtime data into early warnings that prevent unplanned downtime.',
                    'category' => 'Predictive Maintenance',
                    'level' => TrainingPathLevel::INTERMEDIATE,
                    'duration' => '42 hours',
                    'rating' => 4.9,
                    'has_virtual_machine' => true,
                ],
                'modules' => [
                    [
                        'title' => 'Condition Monitoring',
                        'trainingUnits' => [
                            [
                                'title' => 'Collecting Vibration Data',
                                'type' => TrainingUnitType::VIDEO->value,
                                'duration' => '25 min',
                                'content' => 'See how vibration data can reveal subtle machine issues before they become failures.',
                                'objectives' => ['Capture condition-monitoring signals', 'Recognize failure precursors', 'Set up sampling thresholds'],
                                'vm_enabled' => false,
                            ],
                            [
                                'title' => 'Feature Engineering for Maintenance',
                                'type' => TrainingUnitType::READING->value,
                                'duration' => '25 min',
                                'content' => 'Learn how to transform raw sensor data into metrics that make maintenance models smarter.',
                                'objectives' => ['Create useful maintenance features', 'Normalize machine telemetry', 'Prepare data for prediction'],
                                'vm_enabled' => false,
                            ],
                        ],
                    ],
                    [
                        'title' => 'Failure Prediction Lab',
                        'trainingUnits' => [
                            [
                                'title' => 'Detecting Anomalies in Sensor Streams',
                                'type' => TrainingUnitType::PRACTICE->value,
                                'duration' => '35 min',
                                'content' => 'Use maintenance data to flag abnormal patterns and decide when intervention is needed.',
                                'objectives' => ['Spot unusual sensor behavior', 'Compare baseline and anomaly windows', 'Prioritize interventions'],
                                'vm_enabled' => false,
                            ],
                            [
                                'title' => 'Maintenance Dashboard Lab',
                                'type' => TrainingUnitType::VM_LAB->value,
                                'duration' => '50 min',
                                'content' => 'Build a dashboard that helps maintenance teams focus on the most urgent equipment issues.',
                                'objectives' => ['Track asset health', 'Display critical alerts', 'Surface maintenance priorities'],
                                'vm_enabled' => true,
                            ],
                        ],
                    ],
                ],
            ],
            [
                'instructor_email' => 'alex.thompson@example.com',
                'trainingPath' => [
                    'title' => 'OT Cybersecurity Fundamentals',
                    'description' => 'Protect PLCs, HMIs, and industrial networks from intrusion, disruption, and downtime.',
                    'category' => 'OT Cybersecurity',
                    'level' => TrainingPathLevel::BEGINNER,
                    'duration' => '30 hours',
                    'rating' => 4.6,
                    'has_virtual_machine' => true,
                ],
                'modules' => [
                    [
                        'title' => 'OT Asset Inventory',
                        'trainingUnits' => [
                            [
                                'title' => 'Understanding PLC and HMI Surfaces',
                                'type' => TrainingUnitType::VIDEO->value,
                                'duration' => '20 min',
                                'content' => 'Identify the devices that make up an operational technology environment and why they need special protection.',
                                'objectives' => ['Map OT assets', 'Recognize exposure points', 'Describe the attack surface of a plant'],
                                'vm_enabled' => false,
                            ],
                            [
                                'title' => 'Segmentation Basics',
                                'type' => TrainingUnitType::READING->value,
                                'duration' => '20 min',
                                'content' => 'Review how segmentation limits lateral movement and helps isolate production networks.',
                                'objectives' => ['Explain segmentation goals', 'Separate IT and OT zones', 'Apply least-privilege networking'],
                                'vm_enabled' => false,
                            ],
                        ],
                    ],
                    [
                        'title' => 'Defending Industrial Networks',
                        'trainingUnits' => [
                            [
                                'title' => 'Firewall Rules for Plant Networks',
                                'type' => TrainingUnitType::PRACTICE->value,
                                'duration' => '30 min',
                                'content' => 'Build practical firewall policies that support industrial traffic while limiting risk.',
                                'objectives' => ['Write defensive rules', 'Protect critical ports', 'Separate trusted zones'],
                                'vm_enabled' => false,
                            ],
                            [
                                'title' => 'Incident Response Drill',
                                'type' => TrainingUnitType::VM_LAB->value,
                                'duration' => '45 min',
                                'content' => 'Respond to a simulated OT incident and practice the steps needed to restore safe operations.',
                                'objectives' => ['Triage an alert', 'Coordinate containment', 'Document response steps'],
                                'vm_enabled' => true,
                            ],
                        ],
                    ],
                ],
            ],
            [
                'instructor_email' => 'maria.garcia@example.com',
                'trainingPath' => [
                    'title' => 'Robotics & Automation with PLCs',
                    'description' => 'Program automated workcells, orchestrate robots, and coordinate PLC logic for modern production lines.',
                    'category' => 'Robotics & Automation',
                    'level' => TrainingPathLevel::BEGINNER,
                    'duration' => '35 hours',
                    'rating' => 4.7,
                    'has_virtual_machine' => true,
                ],
                'modules' => [
                    [
                        'title' => 'Robot Cells and Safety',
                        'trainingUnits' => [
                            [
                                'title' => 'Industrial Robot Overview',
                                'type' => TrainingUnitType::VIDEO->value,
                                'duration' => '20 min',
                                'content' => 'Explore the kinds of robots used in factories and the jobs they perform on the line.',
                                'objectives' => ['Differentiate common robot types', 'Explain cell layouts', 'Recognize automation use cases'],
                                'vm_enabled' => false,
                            ],
                            [
                                'title' => 'Safety Zones and Interlocks',
                                'type' => TrainingUnitType::READING->value,
                                'duration' => '20 min',
                                'content' => 'Learn how safety systems protect operators, equipment, and the robots themselves.',
                                'objectives' => ['Describe robot safety barriers', 'Apply interlock logic', 'Identify safe operating states'],
                                'vm_enabled' => false,
                            ],
                        ],
                    ],
                    [
                        'title' => 'PLC Coordination Lab',
                        'trainingUnits' => [
                            [
                                'title' => 'Program a Conveyor Sequence',
                                'type' => TrainingUnitType::PRACTICE->value,
                                'duration' => '35 min',
                                'content' => 'Write logic that keeps conveyors, sensors, and actuators in sync during a production cycle.',
                                'objectives' => ['Coordinate automation steps', 'Sequence machine actions', 'Test PLC logic transitions'],
                                'vm_enabled' => false,
                            ],
                            [
                                'title' => 'Robot Cell Integration Lab',
                                'type' => TrainingUnitType::VM_LAB->value,
                                'duration' => '50 min',
                                'content' => 'Bring together robot motion, PLC signals, and operator controls in a simulated cell.',
                                'objectives' => ['Integrate robot and PLC events', 'Validate cell timing', 'Practice production handoff'],
                                'vm_enabled' => true,
                            ],
                        ],
                    ],
                ],
            ],
            [
                'instructor_email' => 'david.kim@example.com',
                'trainingPath' => [
                    'title' => 'Edge AI & Digital Twin Engineering',
                    'description' => 'Deploy machine vision, anomaly detection, and digital twin workflows to the factory edge.',
                    'category' => 'Edge AI & Digital Twins',
                    'level' => TrainingPathLevel::ADVANCED,
                    'duration' => '56 hours',
                    'rating' => 4.8,
                    'has_virtual_machine' => true,
                ],
                'modules' => [
                    [
                        'title' => 'Edge AI Foundations',
                        'trainingUnits' => [
                            [
                                'title' => 'Machine Vision at the Edge',
                                'type' => TrainingUnitType::VIDEO->value,
                                'duration' => '30 min',
                                'content' => 'See how compact AI models can inspect products and flag defects in real time.',
                                'objectives' => ['Recognize edge AI use cases', 'Understand computer vision pipelines', 'Choose the right deployment target'],
                                'vm_enabled' => false,
                            ],
                            [
                                'title' => 'Deploying Lightweight Models',
                                'type' => TrainingUnitType::READING->value,
                                'duration' => '25 min',
                                'content' => 'Learn how to shrink and deploy models so they run efficiently on devices close to the machine.',
                                'objectives' => ['Optimize models for edge hardware', 'Balance latency and accuracy', 'Package inference workflows'],
                                'vm_enabled' => false,
                            ],
                        ],
                    ],
                    [
                        'title' => 'Digital Twin Operations',
                        'trainingUnits' => [
                            [
                                'title' => 'Synchronizing Physical and Virtual Assets',
                                'type' => TrainingUnitType::PRACTICE->value,
                                'duration' => '40 min',
                                'content' => 'Keep a virtual model in sync with a live process so operators can simulate changes safely.',
                                'objectives' => ['Mirror asset states', 'Compare live and simulated data', 'Test production changes safely'],
                                'vm_enabled' => false,
                            ],
                            [
                                'title' => 'Digital Twin Lab',
                                'type' => TrainingUnitType::VM_LAB->value,
                                'duration' => '60 min',
                                'content' => 'Build and explore a digital twin that supports optimization, monitoring, and operator training.',
                                'objectives' => ['Create a working twin', 'Use telemetry for simulation', 'Analyze production scenarios'],
                                'vm_enabled' => true,
                            ],
                        ],
                    ],
                ],
            ],
        ];

        foreach ($catalog as $definition) {
            $trainingPath = TrainingPath::create(array_merge(
                $definition['trainingPath'],
                [
                    'instructor_id' => $instructorUsers[$definition['instructor_email']]->id,
                    'status' => TrainingPathStatus::APPROVED,
                ],
            ));

            foreach ($definition['modules'] as $moduleIndex => $moduleDefinition) {
                $module = TrainingPathModule::create([
                    'training_path_id' => $trainingPath->id,
                    'title' => $moduleDefinition['title'],
                    'sort_order' => $moduleIndex,
                ]);

                foreach ($moduleDefinition['trainingUnits'] as $trainingUnitIndex => $trainingUnitDefinition) {
                    TrainingUnit::create([
                        'module_id' => $module->id,
                        'title' => $trainingUnitDefinition['title'],
                        'type' => $trainingUnitDefinition['type'],
                        'duration' => $trainingUnitDefinition['duration'],
                        'content' => $trainingUnitDefinition['content'],
                        'objectives' => json_encode($trainingUnitDefinition['objectives']),
                        'vm_enabled' => $trainingUnitDefinition['vm_enabled'],
                        'sort_order' => $trainingUnitIndex,
                    ]);
                }
            }
        }

        $this->command->info('Seeded 6 industrial training paths with modules and trainingUnits.');
    }
}
